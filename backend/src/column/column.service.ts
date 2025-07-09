import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Column, ColumnDocument } from 'src/schema/Column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { BoardService } from 'src/board/board.service';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { plainToInstance } from 'class-transformer';
import { ColumnDto } from './dto/response-dto';

@Injectable()
export class ColumnService {
    constructor(
        private readonly boardService: BoardService,
        @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
        @InjectConnection() private readonly connection: Connection
    ) {}

    async createColumn(body: CreateColumnDto, user: UserJwt) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const newColumn = await this.columnModel.create([body], { session });
            await this.boardService.addColumnToBoard(body.boardId, newColumn[0]._id, session);
        
            await session.commitTransaction();
        
            return plainToInstance(ColumnDto, newColumn[0], {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error; // Re-throw the error to be handled by the filter
        } finally {
            session.endSession();
        }
    }

    async getColumnsByBoardId(boardId: Types.ObjectId) {
        const columnIds = await this.boardService.getColumnsId(boardId);

        if (!columnIds || columnIds.length === 0) {
            return [];
        }

        const columns = await this.columnModel.find({ _id: { $in: columnIds } });

        return plainToInstance(ColumnDto, columns, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async getColumnById(id: Types.ObjectId) {
        const column = await this.columnModel.findById(id);

        if(!column) {
            throw new NotFoundException('Column not found');
        }

        return plainToInstance(ColumnDto, column, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updateColumn(id: Types.ObjectId, body: UpdateColumnDto) {
        const column = await this.columnModel.findById(id);

        if (!column) {
            throw new NotFoundException('Column not found');
        }

        const updatedColumn = await this.columnModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        );

        return plainToInstance(ColumnDto, updatedColumn, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteColumn(id: Types.ObjectId) {
        const column = await this.columnModel.deleteOne({ _id: id });
        // make sure to remove the column from the board as well so that it does not leave a orphan reference
        // await this.boardService.removeColumnFromBoard(id);
        if(column.deletedCount === 0) {
            throw new NotFoundException("Column not found or you do not have permission to delete this column")
        }

        return { message: "Column deleted successfully" };
    }
}
