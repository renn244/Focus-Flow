import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { UpdateBoardDto } from './dto/update-board.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto, BoardWithColumnsDto } from './dto/response-dto';
import { TeamGateway } from 'src/team/team.gateway';
import { AuditQueueService } from 'src/audit-queue/audit-queue.service';
import ACTION from 'src/audit-queue/constant/action.constant';

@Injectable()
export class BoardService {
    constructor(
        @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
        private readonly auditQueueService: AuditQueueService,
        private readonly teamGateway: TeamGateway,
    ) {}

    async createBoard(body: CreateBoardDto, user: UserJwt) {
        const newBoard = await this.boardModel.create({
            ...body, projectId: body.projectId,
        });

        this.teamGateway.io.to(body.projectId).emit('boardCreated', 
            plainToInstance(BoardDto, newBoard, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        )

        this.auditQueueService.boardAudit(user, body.projectId, ACTION.CREATE, newBoard.name, newBoard._id.toString());

        return plainToInstance(BoardDto, newBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getBoards(projectId: Types.ObjectId, user: UserJwt) {
        const boards = await this.boardModel.find({ projectId: projectId.toString() }).populate('columns');

        return plainToInstance(BoardWithColumnsDto, boards, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getBoardById(id: Types.ObjectId) {
        const board = await this.boardModel.findById(id).populate('columns');
        
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return plainToInstance(BoardWithColumnsDto, board, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updateBoard(id: Types.ObjectId, body: UpdateBoardDto, user: UserJwt) {
        const updatedBoard = await this.boardModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        ).populate('columns');

        if(!updatedBoard) {
            throw new NotFoundException("Board not found or you do not have permission to update this board");
        }

        this.teamGateway.io.to(updatedBoard.projectId.toString()).emit('boardUpdated', 
            plainToInstance(BoardWithColumnsDto, updatedBoard, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        )

        this.auditQueueService.boardAudit(user, updatedBoard.projectId.toString(), ACTION.UPDATE, updatedBoard.name, updatedBoard._id.toString());

        return plainToInstance(BoardWithColumnsDto, updatedBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteBoard(id: Types.ObjectId, user: UserJwt) {
        const board = await this.boardModel.findOneAndDelete({ _id: id });

        if(!board) {
            throw new NotFoundException("Board not found or you do not have permission to delete this board");
        }

        this.teamGateway.io.to(board.projectId.toString()).emit('boardDeleted', 
            plainToInstance(BoardDto, board, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        );

        this.auditQueueService.boardAudit(user, board.projectId.toString(), ACTION.DELETE, board.name, board._id.toString());

        return { message: "Board deleted successfully" };
    }

    async getColumnsId(boardId: Types.ObjectId) {
        const board = await this.boardModel.findById(boardId).select('columns');

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return board.columns.map(column => column.toString());
    }

    async validateColumnInProject(columnId: Types.ObjectId, projectId: Types.ObjectId) {
        const board = this.boardModel.exists({ columns: { $some: [columnId] }, projectId: projectId });
        return !!board;
    }

    async validateBoardInProject(boardId: Types.ObjectId, projectId: Types.ObjectId) {
        const board = this.boardModel.exists({ _id: boardId, projectId: projectId });
        return !!board;
    }

    // maybe use rabit MQ in here??
    async addColumnToBoard(boardId: string, columnId: Types.ObjectId, session?: ClientSession) {
        // might wanna add permission to check if the board belongs to the user

        const updatedBoard = await this.boardModel.findByIdAndUpdate(
            { _id: boardId }, { $push: { columns: columnId } } , { new: true, session }
        )

        return plainToInstance(BoardDto, updatedBoard, { 
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        }) 
    }

    // maybe use rabit MQ in here??
    async removeColumnFromBoard(boardId: string, columnId: Types.ObjectId, session?: ClientSession) {
        const updatedBoard = await this.boardModel.findByIdAndUpdate(
            { _id: boardId }, { $pull: { columns: columnId } }, { new: true, session }
        );

        return plainToInstance(BoardDto, updatedBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
