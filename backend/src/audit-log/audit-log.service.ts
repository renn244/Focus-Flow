import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { ClientSession, Model, Types } from 'mongoose';
import { AuditAction, AuditChange, AuditEntityType, AuditLog, AuditLogDocument } from 'src/schema/AuditLog.schema';
import { GetProjectActivityQueryDto } from './dto/get-project-activity-query.dto';
import { AuditLogDto, ProjectActivityPageDto } from './dto/response.dto';

/** Emitted after every activity entry is written, for things like Discord posts to react to. */
export const AUDIT_RECORDED = 'audit.recorded';

export type AuditRecordedEvent = {
    auditLogId: string;
    projectId: string;
    actorId: string;
    action: AuditAction;
    entityId: string;
    taskId?: string;
    changes: AuditChange[];
    /** Written inside a transaction: listeners should confirm it was committed before acting. */
    inTransaction: boolean;
};

type RecordAuditEvent = {
    projectId: Types.ObjectId | string;
    actorId: Types.ObjectId | string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: Types.ObjectId | string;
    taskId?: Types.ObjectId | string;
    summary: string;
    changedFields?: string[];
    changes?: AuditChange[];
};

@Injectable()
export class AuditLogService {
    constructor(
        @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
        private readonly events: EventEmitter2,
    ) {}

    async record(event: RecordAuditEvent, session?: ClientSession) {
        const [auditLog] = await this.auditLogModel.create([{
            ...event,
            projectId: new Types.ObjectId(event.projectId),
            actorId: new Types.ObjectId(event.actorId),
            entityId: event.entityId.toString(),
            ...(event.taskId ? { taskId: event.taskId.toString() } : {}),
            changedFields: event.changedFields ?? [],
            changes: event.changes ?? [],
        }], { session });

        const recorded: AuditRecordedEvent = {
            auditLogId: auditLog._id.toString(),
            projectId: event.projectId.toString(),
            actorId: event.actorId.toString(),
            action: event.action,
            entityId: event.entityId.toString(),
            taskId: event.taskId?.toString(),
            changes: event.changes ?? [],
            inTransaction: Boolean(session?.inTransaction()),
        };
        this.events.emit(AUDIT_RECORDED, recorded);

        return auditLog;
    }

    /** True when this actor already logged the same action on the entity within the window. */
    async hasRecentEvent(entityId: Types.ObjectId | string, actorId: Types.ObjectId | string, action: AuditAction, withinMs: number) {
        const recent = await this.auditLogModel.exists({
            entityId: entityId.toString(),
            actorId: new Types.ObjectId(actorId),
            action,
            createdAt: { $gte: new Date(Date.now() - withinMs) },
        });

        return Boolean(recent);
    }

    async getProjectActivity(projectId: Types.ObjectId, query: GetProjectActivityQueryDto): Promise<ProjectActivityPageDto> {
        return this.getActivity({ projectId }, query);
    }

    async getTaskActivity(taskId: Types.ObjectId, query: GetProjectActivityQueryDto): Promise<ProjectActivityPageDto> {
        return this.getActivity({
            $or: [
                { entityType: 'task', entityId: taskId.toString() },
                { taskId: taskId.toString() },
            ],
        }, query);
    }

    private async getActivity(filter: Record<string, unknown>, query: GetProjectActivityQueryDto): Promise<ProjectActivityPageDto> {
        const limit = query.limit ?? 20;
        const logs = await this.auditLogModel
            .find({
                ...filter,
                ...(query.cursor ? { _id: { $lt: new Types.ObjectId(query.cursor) } } : {}),
            })
            .populate('actorId', '_id username displayName avatarUrl')
            .sort({ _id: -1 })
            .limit(limit + 1);

        const hasNextPage = logs.length > limit;
        const items = hasNextPage ? logs.slice(0, limit) : logs;

        return {
            items: plainToInstance(AuditLogDto, items, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            nextCursor: hasNextPage ? items.at(-1)!._id.toString() : null,
        };
    }
}
