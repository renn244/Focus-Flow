import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { ClientSession, Model, Types } from 'mongoose';
import { AuditAction, AuditChange, AuditEntityType, AuditLog, AuditLogDocument } from 'src/schema/AuditLog.schema';
import { GetProjectActivityQueryDto } from './dto/get-project-activity-query.dto';
import { AuditLogDto, ProjectActivityPageDto } from './dto/response.dto';

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

        return auditLog;
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
