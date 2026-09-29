import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceTaskSource.decorator";
import { TaskService } from "../task.service";

@Injectable()
export class TaskAdminAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly taskService: TaskService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the task id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const taskId = request[source][key];

        const projectId = await this.taskService.getProjectIdByTaskId(taskId);
        const isAdminOrOwner = await this.teamSharedService.isUserAdminOrOwnerInProject(projectId, user.id);

        if(!isAdminOrOwner) {
            throw new ForbiddenException('User is not an admin of the project');
        }

        return true;
    }
}
