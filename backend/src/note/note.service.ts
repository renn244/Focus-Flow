import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Note, NoteDocument } from 'src/schema/Note.schema';
import { TaskService } from 'src/task/task.service';
import { TeamSharedService } from 'src/team/team.shared.service';
import { CreateNoteDto, NoteDto, NoteSummaryDto, NoteUserDto, TaskNoteRefDto, UpdateNoteDto } from './dto/note.dto';
import { NoteState, NoteVersionService } from './note-version.service';

/** Tiptap node type used for task mentions inside a note. */
export const TASK_MENTION_NODE = 'taskMention';

/** Repeated edits by one person within this window count as one activity entry. */
const EDIT_ACTIVITY_WINDOW_MS = 10 * 60 * 1000;

const USER_FIELDS = '_id username displayName avatarUrl';

type TiptapNode = { type?: string; attrs?: Record<string, unknown>; content?: TiptapNode[] };

export const extractMentionedTaskIds = (node: TiptapNode | undefined, found = new Set<string>()) => {
    if (!node || typeof node !== 'object') return found;

    if (node.type === TASK_MENTION_NODE && typeof node.attrs?.id === 'string') {
        found.add(node.attrs.id);
    }

    if (Array.isArray(node.content)) {
        for (const child of node.content) extractMentionedTaskIds(child, found);
    }

    return found;
};

const quoteTitle = (title: string) => `“${title.length > 80 ? `${title.slice(0, 79)}…` : title}”`;

@Injectable()
export class NoteService {
    constructor(
        @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
        private readonly taskService: TaskService,
        private readonly teamSharedService: TeamSharedService,
        private readonly auditLogService: AuditLogService,
        private readonly noteVersionService: NoteVersionService,
    ) {}

    private toUser(value: unknown): NoteUserDto {
        const user = value as { _id?: Types.ObjectId; username?: string; displayName?: string; avatarUrl?: string } | null;

        return {
            _id: user?._id?.toString() ?? '',
            username: user?.username ?? 'Deleted user',
            displayName: user?.displayName,
            avatarUrl: user?.avatarUrl,
        };
    }

    private toSummary(note: NoteDocument): NoteSummaryDto {
        const text = (note.contentText ?? '').replace(/\s+/g, ' ').trim();

        return {
            _id: note._id.toString(),
            projectId: note.projectId.toString(),
            title: note.title,
            excerpt: text.length > 160 ? `${text.slice(0, 159)}…` : text,
            pinned: note.pinned,
            taskIds: note.taskIds ?? [],
            createdBy: this.toUser(note.createdBy),
            updatedBy: this.toUser(note.updatedBy),
            createdAt: (note as unknown as { createdAt: Date }).createdAt,
            updatedAt: (note as unknown as { updatedAt: Date }).updatedAt,
        };
    }

    private async toNote(note: NoteDocument, userId: string): Promise<NoteDto> {
        const createdById = (note.createdBy as unknown as { _id?: Types.ObjectId })?._id ?? note.createdBy;
        const canDelete = createdById?.toString() === userId
            || await this.teamSharedService.isUserAdminOrOwnerInProject(note.projectId, userId);

        return { ...this.toSummary(note), content: note.content, canDelete };
    }

    private async linkedTaskIds(content: Record<string, unknown> | undefined, projectId: Types.ObjectId) {
        const mentioned = [...extractMentionedTaskIds(content as TiptapNode)];
        return this.taskService.filterTaskIdsInProject(mentioned, projectId);
    }

    async getNotesByProject(projectId: Types.ObjectId) {
        const notes = await this.noteModel
            .find({ projectId })
            .select('-content')
            .populate('createdBy', USER_FIELDS)
            .populate('updatedBy', USER_FIELDS)
            .sort({ pinned: -1, updatedAt: -1 });

        return notes.map((note) => this.toSummary(note));
    }

    async getNote(noteId: Types.ObjectId, user: UserJwt) {
        const note = await this.noteModel
            .findById(noteId)
            .populate('createdBy', USER_FIELDS)
            .populate('updatedBy', USER_FIELDS);

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        return this.toNote(note, user.id);
    }

    async getNotesByTask(taskId: Types.ObjectId): Promise<TaskNoteRefDto[]> {
        const notes = await this.noteModel
            .find({ taskIds: taskId.toString() })
            .select('_id title updatedAt')
            .sort({ updatedAt: -1 });

        return notes.map((note) => ({
            _id: note._id.toString(),
            title: note.title,
            updatedAt: (note as unknown as { updatedAt: Date }).updatedAt,
        }));
    }

    async createNote(body: CreateNoteDto, user: UserJwt) {
        const projectId = new Types.ObjectId(body.projectId);
        const userId = new Types.ObjectId(user.id);
        const note = await this.noteModel.create({
            projectId,
            title: body.title,
            content: body.content ?? { type: 'doc', content: [] },
            contentText: body.contentText ?? '',
            taskIds: await this.linkedTaskIds(body.content, projectId),
            createdBy: userId,
            updatedBy: userId,
        });

        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'note.created',
            entityType: 'note',
            entityId: note._id,
            summary: `Created the note ${quoteTitle(note.title)}`,
        });

        return this.getNote(note._id, user);
    }

    async updateNote(noteId: Types.ObjectId, body: UpdateNoteDto, user: UserJwt) {
        const existing = await this.noteModel.findById(noteId).select('projectId title pinned content contentText updatedBy updatedAt createdAt');

        if (!existing) {
            throw new NotFoundException('Note not found');
        }

        const contentChanged = body.title !== undefined || body.content !== undefined || body.contentText !== undefined;
        // Keep a copy of the note as it was, when this edit starts a new version.
        if (contentChanged) {
            await this.noteVersionService.beforeEdit(existing as unknown as NoteState, user.id);
        }
        const pinChanged = body.pinned !== undefined && body.pinned !== existing.pinned;
        const update: Record<string, unknown> = {};

        if (body.title !== undefined) update.title = body.title;
        if (body.contentText !== undefined) update.contentText = body.contentText;
        if (body.content !== undefined) {
            update.content = body.content;
            update.taskIds = await this.linkedTaskIds(body.content, existing.projectId);
        }
        if (body.pinned !== undefined) update.pinned = body.pinned;
        // Pinning is not an edit of the note itself, so it leaves "last edited" alone.
        if (contentChanged) update.updatedBy = new Types.ObjectId(user.id);

        const note = await this.noteModel.findByIdAndUpdate(noteId, update, {
            new: true,
            timestamps: contentChanged,
        });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        if (contentChanged) {
            const recentlyLogged = await this.auditLogService.hasRecentEvent(note._id, user.id, 'note.updated', EDIT_ACTIVITY_WINDOW_MS);

            if (!recentlyLogged) {
                await this.auditLogService.record({
                    projectId: note.projectId,
                    actorId: user.id,
                    action: 'note.updated',
                    entityType: 'note',
                    entityId: note._id,
                    summary: `Edited the note ${quoteTitle(note.title)}`,
                    changedFields: [...new Set(Object.keys(body).filter((key) => key !== 'pinned').map((key) => (key === 'contentText' ? 'content' : key)))],
                    ...(body.title !== undefined && body.title !== existing.title
                        ? { changes: [{ field: 'title', from: existing.title, to: body.title }] }
                        : {}),
                });
            }
        }

        if (pinChanged) {
            await this.auditLogService.record({
                projectId: note.projectId,
                actorId: user.id,
                action: note.pinned ? 'note.pinned' : 'note.unpinned',
                entityType: 'note',
                entityId: note._id,
                summary: `${note.pinned ? 'Pinned' : 'Unpinned'} the note ${quoteTitle(note.title)}`,
            });
        }

        return this.getNote(note._id, user);
    }

    async getVersions(noteId: Types.ObjectId) {
        const note = await this.noteModel.findById(noteId).select('projectId title content updatedBy updatedAt');
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        const { current, versions } = await this.noteVersionService.list(note as unknown as NoteState);

        return {
            current,
            versions: versions.map((version) => ({ ...version, savedBy: this.toUser(version.savedBy) })),
        };
    }

    async getVersion(noteId: Types.ObjectId, versionId: Types.ObjectId) {
        const version = await this.noteVersionService.get(noteId, versionId);
        return { ...version, savedBy: this.toUser(version.savedBy) };
    }

    /** Puts an earlier version back. The note as it was is kept as a version first, so a restore can be undone. */
    async restoreVersion(noteId: Types.ObjectId, versionId: Types.ObjectId, user: UserJwt) {
        const note = await this.noteModel.findById(noteId);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        const version = await this.noteVersionService.findForRestore(noteId, versionId);

        await this.noteVersionService.snapshot(note as unknown as NoteState);
        await this.noteModel.updateOne({ _id: noteId }, {
            title: version.title,
            content: version.content,
            contentText: version.contentText,
            taskIds: await this.linkedTaskIds(version.content, note.projectId),
            updatedBy: new Types.ObjectId(user.id),
        });

        await this.auditLogService.record({
            projectId: note.projectId,
            actorId: user.id,
            action: 'note.restored',
            entityType: 'note',
            entityId: note._id,
            summary: `Restored an earlier version of the note ${quoteTitle(version.title)}`,
        });

        return this.getNote(noteId, user);
    }

    async deleteNote(noteId: Types.ObjectId, user: UserJwt) {
        const note = await this.noteModel.findByIdAndDelete(noteId);

        if (!note) {
            throw new NotFoundException('Note not found');
        }
        await this.noteVersionService.deleteForNote(note._id);

        await this.auditLogService.record({
            projectId: note.projectId,
            actorId: user.id,
            action: 'note.deleted',
            entityType: 'note',
            entityId: note._id,
            summary: `Deleted the note ${quoteTitle(note.title)}`,
        });

        return { message: 'Note deleted successfully' };
    }
}
