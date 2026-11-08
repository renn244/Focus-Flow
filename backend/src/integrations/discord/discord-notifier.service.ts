import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Model, Types } from 'mongoose';
import { AUDIT_RECORDED, AuditRecordedEvent } from 'src/audit-log/audit-log.service';
import { AuditLog, AuditLogDocument } from 'src/schema/AuditLog.schema';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { Column, ColumnDocument } from 'src/schema/Column.schema';
import { DiscordEvents, DiscordIntegration, DiscordIntegrationDocument } from 'src/schema/DiscordIntegration.schema';
import { Note, NoteDocument } from 'src/schema/Note.schema';
import { Project, ProjectDocument } from 'src/schema/Project.schema';
import { Task, TaskDocument } from 'src/schema/Task.schema';
import { User, UserDocument } from 'src/schema/User.schema';
import { clientUrl, DiscordIntegrationService } from './discord-integration.service';
import { dailySummaryMessage, noteCreatedMessage, SummaryTask, TaskInfo, taskCreatedMessage, taskMovedMessage } from './discord-messages';
import { dayBounds } from './time';

/** A column with one of these titles counts as finished. */
const DONE_COLUMN = /^(done|complete|completed)$/i;

/** Waits for the transaction that wrote an activity entry to commit before posting about it. */
const COMMIT_WAIT_MS = 1500;
/** New notes start as "Untitled note"; give the author a moment to name it before posting. */
const NOTE_WAIT_MS = 60 * 1000;

const eventFor: Partial<Record<AuditRecordedEvent['action'], keyof DiscordEvents>> = {
    'task.created': 'taskCreated',
    'task.moved': 'taskMoved',
    'note.created': 'noteCreated',
};

type NamedUser = { displayName?: string; username?: string } | null;
const nameOf = (user: NamedUser) => user?.displayName || user?.username || 'Someone';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const summaryTimeZone = () => process.env.DISCORD_SUMMARY_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Turns project activity into Discord posts, and sends the daily due-today summary. */
@Injectable()
export class DiscordNotifierService implements OnModuleInit {
    private readonly logger = new Logger(DiscordNotifierService.name);

    constructor(
        @InjectModel(DiscordIntegration.name) private readonly integrationModel: Model<DiscordIntegrationDocument>,
        @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
        @InjectModel(Column.name) private readonly columnModel: Model<ColumnDocument>,
        @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
        @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly integrations: DiscordIntegrationService,
        private readonly scheduler: SchedulerRegistry,
    ) {}

    onModuleInit() {
        // Registered here rather than with @Cron so the time zone comes from .env, which loads after imports.
        const job = CronJob.from({
            cronTime: '0 8 * * *',
            timeZone: summaryTimeZone(),
            onTick: () => void this.sendDailySummaries(),
        });
        this.scheduler.addCronJob('discord-daily-summary', job);
        job.start();
    }

    private async integrationFor(projectId: string, event: keyof DiscordEvents) {
        const integration = await this.integrationModel.findOne({ projectId: new Types.ObjectId(projectId), channelId: { $ne: null } });
        if (!integration || integration.problem === 'bot_removed') return null;
        return integration.events?.[event] === false ? null : integration;
    }

    @OnEvent(AUDIT_RECORDED, { async: true })
    async onActivity(event: AuditRecordedEvent) {
        const setting = eventFor[event.action];
        if (!setting) return;

        try {
            if (!(await this.integrationFor(event.projectId, setting))) return;

            if (event.inTransaction) {
                await wait(COMMIT_WAIT_MS);
                // Gone means the transaction rolled back: nothing actually happened.
                if (!(await this.auditLogModel.exists({ _id: event.auditLogId }))) return;
            }

            if (event.action === 'note.created') await wait(NOTE_WAIT_MS);

            // Look again: settings may have changed while waiting.
            const integration = await this.integrationFor(event.projectId, setting);
            if (!integration) return;

            const actor = nameOf(await this.userModel.findById(event.actorId).select('displayName username').lean());
            const payload = event.action === 'note.created'
                ? await this.noteMessage(event, actor)
                : await this.taskMessage(event, actor);
            if (payload) await this.integrations.post(integration, payload);
        } catch (error) {
            this.logger.error(`Discord post for ${event.action} failed: ${(error as Error).message}`);
        }
    }

    private async noteMessage(event: AuditRecordedEvent, actor: string) {
        const note = await this.noteModel.findById(event.entityId).select('title').lean();
        if (!note) return null;
        return noteCreatedMessage(actor, note.title, clientUrl(`/projects/${event.projectId}?view=notes&note=${event.entityId}`));
    }

    private async taskMessage(event: AuditRecordedEvent, actor: string) {
        const task = await this.taskModel
            .findById(event.taskId ?? event.entityId)
            .populate<{ columnId: { title: string } | null }>('columnId', 'title')
            .populate<{ boardId: { name: string } | null }>('boardId', 'name')
            .populate<{ assignee: NamedUser }>('assignee', 'displayName username')
            .lean();
        if (!task) return null;

        const info: TaskInfo = {
            title: task.title,
            board: task.boardId?.name ?? 'Board',
            column: task.columnId?.title ?? 'Column',
            assignee: task.assignee ? nameOf(task.assignee) : undefined,
            dueDate: task.dueDate ?? null,
            priority: task.priority,
            checklist: { done: (task.checklist ?? []).filter((item) => item.done).length, total: (task.checklist ?? []).length },
            url: clientUrl(`/projects/${event.projectId}?task=${task._id}`),
        };

        if (event.action === 'task.created') return taskCreatedMessage(actor, info, summaryTimeZone());

        const status = event.changes.find((change) => change.field === 'Status');
        const from = status?.from ?? 'a column';
        const to = status?.to ?? info.column;
        return taskMovedMessage(actor, info, from, to, DONE_COLUMN.test(to.trim()));
    }

    /** Posts each project's tasks that are due today or overdue and not finished. Quiet days post nothing. */
    async sendDailySummaries() {
        const integrations = await this.integrationModel.find({ channelId: { $ne: null }, 'events.dailySummary': { $ne: false }, problem: { $ne: 'bot_removed' } });
        for (const integration of integrations) {
            try {
                const payload = await this.summaryFor(integration.projectId);
                if (payload) await this.integrations.post(integration, payload);
            } catch (error) {
                this.logger.error(`Daily summary for project ${integration.projectId} failed: ${(error as Error).message}`);
            }
        }
    }

    /** The summary for one project, or null when nothing is due. */
    async summaryFor(projectId: Types.ObjectId) {
        const project = await this.projectModel.findById(projectId).select('name').lean();
        if (!project) return null;

        // Older documents store projectId as a string, newer as an ObjectId; compare as strings.
        const boards = await this.boardModel
            .find({ $expr: { $eq: [{ $toString: '$projectId' }, projectId.toString()] } })
            .select('_id')
            .lean();
        if (boards.length === 0) return null;

        const { start, end } = dayBounds(new Date(), summaryTimeZone());
        const tasks = await this.taskModel
            // boardId has the same mix of strings and ObjectIds, so it's compared as a string too.
            .find({ $expr: { $in: [{ $toString: '$boardId' }, boards.map((board) => String(board._id))] }, dueDate: { $ne: null, $lte: end } })
            .populate<{ columnId: { title: string } | null }>('columnId', 'title')
            .populate<{ assignee: NamedUser }>('assignee', 'displayName username')
            .sort({ dueDate: 1 })
            .lean();

        const open: SummaryTask[] = tasks
            .filter((task) => !DONE_COLUMN.test(task.columnId?.title?.trim() ?? ''))
            .map((task) => ({
                title: task.title,
                assignee: task.assignee ? nameOf(task.assignee) : undefined,
                overdue: Boolean(task.dueDate && task.dueDate < start),
            }));
        if (open.length === 0) return null;

        return dailySummaryMessage(project.name, open, clientUrl(`/projects/${projectId}`));
    }
}
