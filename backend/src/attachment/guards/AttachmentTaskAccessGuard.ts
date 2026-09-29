import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { TaskService } from 'src/task/task.service';
import { TeamSharedService } from 'src/team/team.shared.service';

@Injectable()
export class AttachmentTaskAccessGuard implements CanActivate {
    constructor(
        private readonly taskService: TaskService,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const projectId = await this.taskService.getProjectIdByTaskId(request.params.taskId);
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, request.user.id);

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this task');
        }

        request.attachmentProjectId = projectId;
        return true;
    }
}
