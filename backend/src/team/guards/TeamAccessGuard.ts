import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { TeamSharedService } from "../team.shared.service";
import { TeamGateway } from "../team.gateway";
import { Reflector } from "@nestjs/core";
import { Types } from "mongoose";
import { getSourceAndKey } from "../decorators/ResourceTeamSource.decorator";
import { TeamService } from "../team.service";

@Injectable()
export class TeamAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly teamGateway: TeamGateway,
        private readonly teamService: TeamService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the teamMember id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const teamId = request[source][key];

        // Active project from the gateway (current socket session)
        const projectId = this.teamGateway.getProjectIdByUserId(user.id);

        // Check: (1) teamMember belong to this project, (2) user is a project member
        const [isTeamInProject, isMember] = await Promise.all([
            this.teamService.validateTeamMemberInProject(teamId, new Types.ObjectId(projectId)),
            this.teamSharedService.isUserMemberInProject(new Types.ObjectId(projectId), user.id)
        ])
        
        if(!isTeamInProject) {
            throw new ForbiddenException('team is not in the project');
        }

        if(!isMember) {
            throw new ForbiddenException('User is not a member of the project');
        }

        return true;
    }
}