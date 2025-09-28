import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Types } from "mongoose";
import { BoardService } from "src/board/board.service";
import { TeamGateway } from "src/team/team.gateway";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey, RESOURCE_COLUMN_SOURCE, ResourceColumnSource } from "../decorators/ResourceColumnSource.decorator";

@Injectable()
export class ColumnAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly teamGateway: TeamGateway,
        private readonly boardService: BoardService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the column id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const columnId = request[source][key];

        // Active project from the gateway (current socket session)
        const projectId = this.teamGateway.getProjectIdByUserId(user.id);

        // Check: (1) column belongs to this project, (2) user is a project member
        const [isColumnInProject, isMember] = await Promise.all([
            this.boardService.validateColumnInProject(columnId, new Types.ObjectId(projectId)),
            this.teamSharedService.isUserMemberInProject(new Types.ObjectId(projectId), user.id)
        ])

        if(!isColumnInProject) {
            throw new ForbiddenException('column is not in the project')
        }

        if(!isMember) {
            throw new ForbiddenException('User is not a member of the project');
        }

        return true;
    }
}