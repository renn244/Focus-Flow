import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { BoardService } from "src/board/board.service";
import { TeamGateway } from "src/team/team.gateway";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceColumnSource.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ColumnAdminAccessGuard implements CanActivate {
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

        // Check: (1) column belongs to this project, (2) user is a project member with admin role
        const [isColumnInProject, isAdminOrOwner] = await Promise.all([
            this.boardService.validateColumnInProject(columnId, new Types.ObjectId(projectId)),
            this.teamSharedService.isUserAdminOrOwnerInProject(new Types.ObjectId(projectId), user.id)
        ])

        if(!isColumnInProject) {
            throw new ForbiddenException('column is not in the project')
        }

        if(!isAdminOrOwner) {
            throw new ForbiddenException('User is not an admin or owner of the project');
        }

        return true;
    }
}