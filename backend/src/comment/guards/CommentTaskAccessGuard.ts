import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TaskService } from 'src/task/task.service';
import { TeamSharedService } from 'src/team/team.shared.service';
import { getSourceAndKey } from 'src/task/decorators/ResourceTaskSource.decorator';

@Injectable()
export class CommentTaskAccessGuard implements CanActivate {
    constructor(
        private readonly taskService: TaskService,
        private readonly teamSharedService: TeamSharedService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { source, key } = getSourceAndKey(this.reflector, context);
        const taskId = request[source][key];
        const projectId = await this.taskService.getProjectIdByTaskId(taskId);
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, request.user.id);

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this task');
        }

        request.taskProjectId = projectId;
        return true;
    }
}
