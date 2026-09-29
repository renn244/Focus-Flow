import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { BoardService } from "src/board/board.service";
import { TeamSharedService } from "src/team/team.shared.service";
import { getSourceAndKey } from "../decorators/ResourceColumnSource.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ColumnAdminAccessGuard implements CanActivate {
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
        const isAdminOrOwner = await this.teamSharedService.isUserAdminOrOwnerInProject(projectId, user.id);

        if(!isAdminOrOwner) {
            throw new ForbiddenException('User is not an admin or owner of the project');
        }

        return true;
    }
}
