import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { UpdateBoardDto } from './dto/update-board.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto, BoardWithColumnsDto } from './dto/response-dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditQueueService } from 'src/audit-queue/audit-queue.service';
import ACTION from 'src/audit-queue/constants/action.constants';

@Injectable()
export class BoardService {
    constructor(
        @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
        @InjectQueue('audit-log-queue') private auditLogQueue: Queue,
        private readonly auditQueueService: AuditQueueService,
    ) {}

    async createBoard(body: CreateBoardDto, user: UserJwt) {
        const newBoard = await this.boardModel.create({
            ...body, projectId: body.projectId,
        });

        this.auditQueueService.boardAudit(user, ACTION.POST, newBoard.name, newBoard._id.toString());

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
        const board = await this.boardModel.findById(id);

        if(!board) {
            throw new NotFoundException('Board not found');
        }

        const updatedBoard = await this.boardModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        ).populate('columns');

        if(!updatedBoard) {
            throw new NotFoundException('Board not found or you do not have permission to update this board');
        };

        this.auditQueueService.boardAudit(user, ACTION.EDIT, updatedBoard.name, updatedBoard._id.toString());

        return plainToInstance(BoardWithColumnsDto, updatedBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteBoard(id: Types.ObjectId, user: UserJwt) {
        const board = await this.boardModel.deleteOne({ _id: id });

        if(board.deletedCount === 0) {
            throw new NotFoundException("Board not found or you do not have permission to delete this board");
        }

        this.auditQueueService.boardAudit(user, ACTION.DELETE, id.toString(), id.toString());
        
        return { message: "Board deleted successfully" };
    }

    async getColumnsId(boardId: Types.ObjectId) {
        const board = await this.boardModel.findById(boardId).select('columns');

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return board.columns.map(column => column.toString());
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
