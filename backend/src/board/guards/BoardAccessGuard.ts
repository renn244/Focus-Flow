import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getSourceAndKey } from "src/board/decorators/ResourceBoardSource.decorator";
import { TeamSharedService } from "src/team/team.shared.service";
import { BoardService } from "../board.service";

@Injectable()
export class BoardAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly boardService: BoardService,
        private readonly reflector: Reflector,
    ) {}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the board id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const boardId = request[source][key];

        const projectId = await this.boardService.getProjectIdByBoardId(boardId);
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, user.id);

        if(!isMember) {
            throw new ForbiddenException('User is not a member of the project');
        }

        return true;
    }
}
