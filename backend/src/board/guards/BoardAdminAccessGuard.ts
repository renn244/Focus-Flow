import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Types } from "mongoose";
import { getSourceAndKey } from "src/board/decorators/ResourceBoardSource.decorator";
import { TeamGateway } from "src/team/team.gateway";
import { TeamSharedService } from "src/team/team.shared.service";
import { BoardService } from "../board.service";

@Injectable()
export class BoardAdminAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly teamGateway: TeamGateway,
        private readonly boardService: BoardService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the board id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const boardId = request[source][key];

        // Active project from the gateway (current socket session)
        const projectId = this.teamGateway.getProjectIdByUserId(user.id);

        // Check: (1) board belong to this project, (2) user is a project member
        const [isBoardInProject, isAdminOrOwner] = await Promise.all([
            this.boardService.validateBoardInProject(boardId, new Types.ObjectId(projectId)),
            this.teamSharedService.isUserAdminOrOwnerInProject(new Types.ObjectId(projectId), user.id)
        ])
        
        if(!isBoardInProject) {
            throw new ForbiddenException('board is not in the project');
        }

        if(!isAdminOrOwner) {
            throw new ForbiddenException('User is not an admin or owner of the project');
        }

        return true;
    }
}