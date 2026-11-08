import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NoteVersion, NoteVersionDocument } from 'src/schema/NoteVersion.schema';
import { countChanges, noteBlocks } from './note-blocks';

/** A new copy is taken at most this often while the same person keeps editing. */
export const VERSION_INTERVAL_MS = 10 * 60 * 1000;
export const MAX_VERSIONS_PER_NOTE = 50;

const USER_FIELDS = '_id username displayName avatarUrl';

/** The parts of a note a version copies. */
export type NoteState = {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    title: string;
    content: Record<string, unknown>;
    contentText?: string;
    updatedBy: Types.ObjectId | { _id: Types.ObjectId };
    updatedAt: Date;
    createdAt?: Date;
};

const idOf = (value: Types.ObjectId | { _id: Types.ObjectId }) =>
    (value as { _id?: Types.ObjectId })._id ?? (value as Types.ObjectId);

const sameState = (version: Pick<NoteVersion, 'title' | 'content'>, note: Pick<NoteState, 'title' | 'content'>) =>
    version.title === note.title && JSON.stringify(version.content) === JSON.stringify(note.content);

/**
 * Keeps earlier copies of notes. A copy is taken just before an edit when someone else
 * was the last to edit, when the last copy is over ten minutes old, or before a restore.
 */
@Injectable()
export class NoteVersionService {
    constructor(@InjectModel(NoteVersion.name) private readonly versionModel: Model<NoteVersionDocument>) {}

    private latest(noteId: Types.ObjectId) {
        return this.versionModel.findOne({ noteId }).sort({ savedAt: -1 });
    }

    /** Called before `editorId` saves a change to the note. */
    async beforeEdit(note: NoteState, editorId: string) {
        const latest = await this.latest(note._id);
        const otherEditor = idOf(note.updatedBy).toString() !== editorId;
        // Measured from when the last copy was taken; a note with no copies yet counts from its creation.
        const lastCopyAt = (latest as unknown as { createdAt?: Date } | null)?.createdAt;
        const since = lastCopyAt ?? note.createdAt ?? note.updatedAt;
        const stale = Date.now() - new Date(since).getTime() > VERSION_INTERVAL_MS;
        if (otherEditor || stale) await this.snapshot(note, latest);
    }

    /** Copies the note as it is now, unless that's already the newest copy or the note is still empty. */
    async snapshot(note: NoteState, latest?: NoteVersionDocument | null) {
        const previous = latest === undefined ? await this.latest(note._id) : latest;
        if (previous && sameState(previous, note)) return;

        const blocks = noteBlocks(note.content);
        if (!previous && blocks.length === 0) return;

        const { added, removed } = countChanges(previous ? noteBlocks(previous.content) : [], blocks);
        await this.versionModel.create({
            noteId: note._id,
            projectId: note.projectId,
            title: note.title,
            content: note.content,
            contentText: note.contentText ?? '',
            savedBy: idOf(note.updatedBy),
            savedAt: note.updatedAt,
            added,
            removed,
        });
        await this.prune(note._id);
    }

    private async prune(noteId: Types.ObjectId) {
        const old = await this.versionModel
            .find({ noteId })
            .sort({ savedAt: -1 })
            .skip(MAX_VERSIONS_PER_NOTE)
            .select('_id');
        if (old.length) await this.versionModel.deleteMany({ _id: { $in: old.map((version) => version._id) } });
    }

    /** Every kept version, newest first, plus how the live note differs from the newest one. */
    async list(note: NoteState) {
        const versions = await this.versionModel
            .find({ noteId: note._id })
            .sort({ savedAt: -1 })
            .select('savedBy savedAt added removed title content')
            .populate('savedBy', USER_FIELDS);

        const newest = versions[0];
        const current = newest
            ? sameState(newest, note)
                ? { added: 0, removed: 0 }
                : countChanges(noteBlocks(newest.content), noteBlocks(note.content))
            : countChanges([], noteBlocks(note.content));

        return {
            current,
            versions: versions.map((version) => ({
                _id: version._id.toString(),
                savedBy: version.savedBy as unknown,
                savedAt: version.savedAt,
                added: version.added,
                removed: version.removed,
            })),
        };
    }

    /** One version with the version before it, which its changes are measured against. */
    async get(noteId: Types.ObjectId, versionId: Types.ObjectId) {
        const version = await this.versionModel.findOne({ _id: versionId, noteId }).populate('savedBy', USER_FIELDS);
        if (!version) throw new NotFoundException('That version no longer exists');

        const previous = await this.versionModel
            .findOne({ noteId, savedAt: { $lt: version.savedAt } })
            .sort({ savedAt: -1 })
            .select('title content');

        return {
            _id: version._id.toString(),
            title: version.title,
            content: version.content,
            savedBy: version.savedBy as unknown,
            savedAt: version.savedAt,
            previous: previous ? { title: previous.title, content: previous.content } : null,
        };
    }

    async findForRestore(noteId: Types.ObjectId, versionId: Types.ObjectId) {
        const version = await this.versionModel.findOne({ _id: versionId, noteId });
        if (!version) throw new NotFoundException('That version no longer exists');
        return version;
    }

    async deleteForNote(noteId: Types.ObjectId): Promise<void> {
        await this.versionModel.deleteMany({ noteId });
    }
}
