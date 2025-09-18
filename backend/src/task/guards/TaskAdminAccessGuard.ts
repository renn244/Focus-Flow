import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Types } from "mongoose";
import { TeamGateway } from "src/team/team.gateway";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceTaskSource.decorator";
import { TaskService } from "../task.service";

@Injectable()
export class TaskAdminAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly teamGateway: TeamGateway,
        private readonly taskService: TaskService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the task id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const taskId = request[source][key];

        // Active project from the gateway (current socket session)
        const projectId = this.teamGateway.getProjectIdByUserId(user.id);

        // Check: (1) task belong to this project, (2) user is a project admin
        const [isTaskInProject, isAdminOrOwner] = await Promise.all([
            this.taskService.validateTaskInProject(taskId, new Types.ObjectId(projectId)),
            this.teamSharedService.isUserAdminOrOwnerInProject(new Types.ObjectId(projectId), user.id)
        ])

        if(!isTaskInProject) {
            throw new ForbiddenException('Task is not in the project');
        }

        if(!isAdminOrOwner) {
            throw new ForbiddenException('User is not an admin of the project');
        }

        return true;
    }
}