import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { promises as fs } from 'fs';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { ATTACHMENTS_DIRECTORY } from 'src/attachment/attachment.constants';
import { Attachment } from 'src/schema/Attachment.schema';
import { Board } from 'src/schema/Board.schema';
import { Column } from 'src/schema/Column.schema';
import { Comment } from 'src/schema/Comment.schema';
import { DiscordIntegration } from 'src/schema/DiscordIntegration.schema';
import { Note } from 'src/schema/Note.schema';
import { NoteVersion } from 'src/schema/NoteVersion.schema';
import { Task } from 'src/schema/Task.schema';
import { TeamMember } from 'src/schema/TeamMember.schema';

/** A task counts as finished when it sits in a column called Done, Complete or Completed. */
const DONE_COLUMN = /^\s*(done|complete|completed)\s*$/i;

export type ProjectTaskCounts = { totalTasks: number; completedTasks: number; openTasks: number; progress: number };

const EMPTY_COUNTS: ProjectTaskCounts = { totalTasks: 0, completedTasks: 0, openTasks: 0, progress: 0 };

/** Ids are stored as ObjectIds in some collections and strings in others; match both. */
const anyIdForm = (ids: Types.ObjectId[]) => ({ $in: [...ids, ...ids.map((id) => id.toString())] });

/** Everything a project owns outside its own document: task counts and cleanup on delete. */
@Injectable()
export class ProjectDataService {
    private readonly logger = new Logger(ProjectDataService.name);

    constructor(
        @InjectModel(Board.name) private readonly boardModel: Model<Board>,
        @InjectModel(Column.name) private readonly columnModel: Model<Column>,
        @InjectModel(Task.name) private readonly taskModel: Model<Task>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
        @InjectModel(Attachment.name) private readonly attachmentModel: Model<Attachment>,
        @InjectModel(Note.name) private readonly noteModel: Model<Note>,
        @InjectModel(NoteVersion.name) private readonly noteVersionModel: Model<NoteVersion>,
        @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMember>,
        @InjectModel(DiscordIntegration.name) private readonly discordModel: Model<DiscordIntegration>,
    ) {}

    /** Live task counts per project, from the tasks on its boards. */
    async countTasks(projectIds: Types.ObjectId[]): Promise<Map<string, ProjectTaskCounts>> {
        const counts = new Map<string, ProjectTaskCounts>();
        if (projectIds.length === 0) return counts;

        const boards = await this.boardModel.find({ projectId: anyIdForm(projectIds) }).select('_id projectId columns').lean();
        if (boards.length === 0) return counts;

        const columns = await this.columnModel.find({ _id: { $in: boards.flatMap((board) => board.columns ?? []) } }).select('_id title').lean();
        const doneColumns = new Set(columns.filter((column) => DONE_COLUMN.test(column.title ?? '')).map((column) => column._id.toString()));
        const projectByBoard = new Map(boards.map((board) => [board._id.toString(), board.projectId.toString()]));

        const tasks = await this.taskModel.find({ boardId: anyIdForm(boards.map((board) => board._id)) }).select('boardId columnId').lean();
        for (const task of tasks) {
            const projectId = projectByBoard.get(task.boardId.toString());
            if (!projectId) continue;
            const entry = counts.get(projectId) ?? { ...EMPTY_COUNTS };
            entry.totalTasks += 1;
            if (task.columnId && doneColumns.has(task.columnId.toString())) entry.completedTasks += 1;
            counts.set(projectId, entry);
        }

        for (const entry of counts.values()) {
            entry.openTasks = entry.totalTasks - entry.completedTasks;
            entry.progress = entry.totalTasks ? Math.round((entry.completedTasks / entry.totalTasks) * 100) : 0;
        }
        return counts;
    }

    countsFor(counts: Map<string, ProjectTaskCounts>, projectId: Types.ObjectId | string) {
        return counts.get(projectId.toString()) ?? EMPTY_COUNTS;
    }

    /** Removes everything that belongs to a project. The activity log is kept as a record. */
    async deleteProjectData(projectId: Types.ObjectId) {
        const projectIds = anyIdForm([projectId]);
        const boards = await this.boardModel.find({ projectId: projectIds }).select('_id columns').lean();
        const boardIds = boards.map((board) => board._id);
        const tasks = await this.taskModel.find({ boardId: anyIdForm(boardIds) }).select('_id').lean();
        const taskIds = anyIdForm(tasks.map((task) => task._id));

        const attachments = await this.attachmentModel.find({ $or: [{ projectId: projectIds }, { taskId: taskIds }] }).select('storedFilename').lean();
        await Promise.all(attachments.map((attachment) => this.removeAttachmentFile(attachment.storedFilename)));

        await Promise.all([
            this.attachmentModel.deleteMany({ $or: [{ projectId: projectIds }, { taskId: taskIds }] }),
            this.commentModel.deleteMany({ taskId: taskIds }),
            this.taskModel.deleteMany({ boardId: anyIdForm(boardIds) }),
            this.columnModel.deleteMany({ _id: { $in: boards.flatMap((board) => board.columns ?? []) } }),
            this.boardModel.deleteMany({ _id: { $in: boardIds } }),
            this.noteVersionModel.deleteMany({ projectId: projectIds }),
            this.noteModel.deleteMany({ projectId: projectIds }),
            this.teamMemberModel.deleteMany({ projectId: projectIds }),
            this.discordModel.deleteMany({ projectId: projectIds }),
        ]);
    }

    private async removeAttachmentFile(storedFilename?: string) {
        if (!storedFilename) return;
        const filePath = path.resolve(ATTACHMENTS_DIRECTORY, storedFilename);
        if (!filePath.startsWith(`${ATTACHMENTS_DIRECTORY}${path.sep}`)) return;
        await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') this.logger.warn(`Could not remove ${storedFilename}: ${error.message}`);
        });
    }
}
