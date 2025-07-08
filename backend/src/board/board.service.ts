import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { UpdateBoardDto } from './dto/update-board.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto, BoardWithColumnsDto } from './dto/response-dto';

@Injectable()
export class BoardService {
    constructor(
        @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    ) {}

    async createBoard(body: CreateBoardDto, user: UserJwt) {
        const newBoard = await this.boardModel.create({
            ...body, projectId: body.projectId,
        });

        return plainToInstance(BoardDto, newBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getBoards(projectId: Types.ObjectId, user: UserJwt) {
        const boards = await this.boardModel.find({ projectId }).populate('columns');
        
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

        return plainToInstance(BoardWithColumnsDto, updatedBoard, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteBoard(id: Types.ObjectId, user: UserJwt) {
        const project = await this.boardModel.deleteOne({ _id: id });

        if(project.deletedCount === 0) {
            throw new NotFoundException("Board not found or you do not have permission to delete this board");
        }

        return { message: "Board deleted successfully" };
    }
}
