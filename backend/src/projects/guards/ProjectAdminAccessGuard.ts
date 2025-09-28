import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Types } from "mongoose";
import { TeamGateway } from "src/team/team.gateway";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceProjectSource.decorator";

@Injectable()
export class ProjectAdminAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the project id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const projectId: string = request[source][key];

        // we don't need to know what project he is active in because he can still use 
        // it while not in the current project
        // but if there is a situation where we need to know we might use another guard
        // NO USE!: const projectId = this.teamGateway.getProjectIdByUserId(user.id);

        const isAdmin = await this.teamSharedService.isUserAdminOrOwnerInProject(new Types.ObjectId(projectId), user.id);

        if(!isAdmin) {
            throw new ForbiddenException('User is not an admin or owner of the project');
        }

        return true;
    }
}