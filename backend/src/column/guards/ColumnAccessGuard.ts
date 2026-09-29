import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BoardService } from "src/board/board.service";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceColumnSource.decorator";

@Injectable()
export class ColumnAccessGuard implements CanActivate {
    constructor(
        private readonly teamSharedService: TeamSharedService,
        private readonly boardService: BoardService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // get the column id from the specified source and key
        const { source, key } = getSourceAndKey(this.reflector, context);
        const columnId = request[source][key];

        const projectId = await this.boardService.getProjectIdByColumnId(columnId);
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, user.id);

        if(!isMember) {
            throw new ForbiddenException('User is not a member of the project');
        }

        return true;
    }
}
