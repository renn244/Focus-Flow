import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Board, BoardDocument } from "src/schema/Board.schema";

@Injectable()
export class BoardAccessGuard implements CanActivate {
    constructor(
        @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    ) {}

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const boardId = request.params?.id || request.body?.boardId;
        
        if(!user) throw new UnauthorizedException("User not authenticated");

        const board = await this.boardModel.findById(boardId)
            .populate<{ projectId: { projectId: Types.ObjectId, ownerId: Types.ObjectId } }>('projectId', 'projectId ownerId')


        if(!board || !board.projectId) {
            throw new NotFoundException("Board or Project not found")
        }

        // later on also add if the user is a member of the project
        // or if there is a role based access control in place
        // isOwner 
        if(board?.projectId.ownerId.toString() !== user.id.toString()) {
            return false
        }

        return true
    }
}