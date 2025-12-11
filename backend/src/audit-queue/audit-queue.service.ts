import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { ActionType } from './interface/constant';
import RESOURCE_TYPE from './constant/resourcesType.constant';

@Injectable()
export class AuditQueueService {
    constructor(
        @InjectQueue('audit-log-queue') private readonly auditLogQueue: Queue,
    ) {}

    // TODO LATER: Add Reason for auditing

    async addAudit(data: any) {
        return this.auditLogQueue.add('audit-log-job', data);
    }

    async taskAudit(user: UserJwt, projectId: string, action: ActionType, taskName: string, taskId: string) {
        return this.addAudit({
            userId: user.id, userEmail: user.email, userName: user.displayName,
            action: action,
            projectId: projectId,
            resourceType: RESOURCE_TYPE.TASK,
            resourceName: taskName,
            resourceId: taskId,
            log: `${user.displayName} ${action} task: ${taskName}`,
        });
    }

    async boardAudit(user: UserJwt, projectId: string, action: ActionType, boardName: string, boardId: string) {
        return this.addAudit({
            userId: user.id, userEmail: user.email, userName: user.displayName,
            action: action,
            projectId: projectId,
            resourceType: RESOURCE_TYPE.BOARD,
            resourceName: boardName,
            resourceId: boardId,
            log: `${user.displayName} ${action} board: ${boardName}`,
        });
    }

    async columnAudit(user: UserJwt, projectId: string, action: ActionType, columnName: string, columnId: string) {
        return this.addAudit({
            userId: user.id, userEmail: user.email, userName: user.displayName,
            action: action,
            projectId: projectId,
            resourceType: RESOURCE_TYPE.COLUMN,
            resourceName: columnName,
            resourceId: columnId,
            log: `${user.displayName} ${action} column: ${columnName}`,
        });
    }

    async projectAudit(user: UserJwt, action: ActionType, projectName: string, projectId: string) {
        return this.addAudit({
            userId: user.id, userEmail: user.email, userName: user.displayName,
            action: action,
            projectId: projectId,
            resourceType: RESOURCE_TYPE.PROJECT,
            resourceName: projectName,
            resourceId: projectId,
            log: `${user.displayName} ${action} project: ${projectName}`,
        })
    }

    async teamAudit(user: UserJwt, projectId: string, action: ActionType, teamName: string, teamId: string) {
        return this.addAudit({
            userId: user.id, userEmail: user.email, userName: user.displayName,
            action: action,
            projectId: projectId,
            resourceType: RESOURCE_TYPE.TEAM,
            resourceName: teamName,
            resourceId: teamId,
            log: `${user.displayName} ${action} team member: ${teamName}`,
        })
    }
}