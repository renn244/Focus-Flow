import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { ClientSession, Connection, Model, Types, UpdateOneModel } from 'mongoose';
import { BoardService } from 'src/board/board.service';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Column, ColumnDocument } from 'src/schema/Column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { ColumnDto, ColumnWithBoardIdDto, ColumnWithTasksDto } from './dto/response-dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { TeamGateway } from 'src/team/team.gateway';

@Injectable()
export class ColumnService {
    constructor(
        private readonly boardService: BoardService,
        private readonly teamGateway: TeamGateway,
        @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
        @InjectConnection() private readonly connection: Connection
    ) {}

    async createColumn(body: CreateColumnDto, user: UserJwt) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const newColumn = await this.columnModel.create([{...body, order: 99}], { session });
            const board = await this.boardService.addColumnToBoard(body.boardId, newColumn[0]._id, session);
        
            await session.commitTransaction();

            this.teamGateway.io.to(board.projectId.toString()).emit('columnCreated', 
                plainToInstance(ColumnWithBoardIdDto, {...newColumn[0], boardId: board._id}, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                })
            )

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

    // This method is gonna be used with rabbit mq listening to create preset columns when a board is created
    async createPresetColumn(boardId: Types.ObjectId) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const newColumn = await this.columnModel.bulkWrite([
                {
                    insertOne: {
                        document: { name: "To Do", order: 0, color: "#9CA3AF", boardId }
                    }
                },
                {
                    insertOne: {
                        document: { name: "In Progress", order: 1, color: "#3B82F6", boardId }
                    }
                },
                {
                    insertOne: {
                        document: { name: "Completed", order: 2, color: "#22C55E", boardId }
                    }
                }
            ]);
            
            await this.boardService.addColumnToBoard(boardId.toString(), newColumn[0]._id, session);
            await session.commitTransaction();
        
            const columns = await this.getColumnsByBoardId(boardId); // Refresh the columns after creation

            return plainToInstance(ColumnDto, columns, {
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

        const columns = await this.columnModel.find({ _id: { $in: columnIds } })
            .populate({ 
                path: 'tasks', 
                populate: [
                    {
                        path: 'boardId',
                        select: 'name _id'
                    },
                    {
                        path: 'columnId',
                        select: 'title color _id'
                    }
                ]
            })
            .sort({ order: 1 });
        

        return plainToInstance(ColumnWithTasksDto, columns, {
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

    async updateColumn(id: Types.ObjectId, body: UpdateColumnDto, user: UserJwt) {
        const column = await this.columnModel.findById(id);

        if (!column) {
            throw new NotFoundException('Column not found');
        }

        const updatedColumn = await this.columnModel.findOneAndUpdate(
            { _id: id }, body, { new: true, lean: true }
        );

        if(!updatedColumn) {
            throw new NotFoundException("Column not found or you do not have permission to update this column")
        }

        const projectId = this.teamGateway.getProjectIdByUserId(user.id);
        this.teamGateway.io.to(projectId).emit('columnUpdated', 
            plainToInstance(ColumnWithBoardIdDto, {...updatedColumn, boardId: body.boardId}, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        );

        return plainToInstance(ColumnDto, updatedColumn, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updateOrderColumns(
        boardId: Types.ObjectId, 
        body: { columns: { _id: Types.ObjectId, order: number }[] },
        user: UserJwt
    ) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const columnIds = await this.boardService.getColumnsId(boardId);
            if (!columnIds || columnIds.length === 0) {
                throw new NotFoundException('No columns found for this board');
            }

            const updatedColumns = await this.columnModel.bulkWrite(
                body.columns.map(column => ({
                    updateOne: {
                        filter: { _id: column._id },
                        update: { $set: { order: column.order } },
                    } satisfies UpdateOneModel<ColumnDocument>
                }))
            )
            
            await session.commitTransaction();

            // SHOULD GIVE THE COLUMNS??
            const projectId = this.teamGateway.getProjectIdByUserId(user.id);
            this.teamGateway.io.to(projectId).emit('columnsReordered', { boardId, columns: body.columns });

            return { message: "Columns reordered successfully", updatedCount: updatedColumns.modifiedCount };
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            throw error; // Re-throw the error to be handled by the filter
        } finally {
            session.endSession();
        }
    }

    async deleteColumn(id: Types.ObjectId, user: UserJwt) {
        const column = await this.columnModel.findOneAndDelete({ _id: id });
        // find away to get the board id from the column
        // make sure to remove the column from the board as well so that it does not leave a orphan reference
        // await this.boardService.removeColumnFromBoard(id);
        if(!column) {
            throw new NotFoundException("Column not found or you do not have permission to delete this column")
        }

        const projectId = this.teamGateway.getProjectIdByUserId(user.id);
        this.teamGateway.io.to(projectId).emit('columnDeleted', 
            plainToInstance(ColumnDto, column, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        );

        return { message: "Column deleted successfully" };
    }

    async getTasksId(columnId: Types.ObjectId) {
        const column = await this.columnModel.findById(columnId).select('tasks');

        if(!column) {
            throw new NotFoundException('Column not found');
        }

        return column.tasks.map(task => task.toString());
    }

    async addTaskToColumn(columnId: string, taskId: Types.ObjectId, session?: ClientSession) {
        // might wanna add permission to check if the column belongs to the user
        const updatedColumn = await this.columnModel.findOneAndUpdate(
            { _id: columnId }, { $push: { tasks: taskId } }, { new: true }
        );

        return plainToInstance(ColumnDto, updatedColumn, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async removeTaskFromColumn(columnId: string, taskId: Types.ObjectId, session?: ClientSession) {
        const updatedColumn = await this.columnModel.findOneAndUpdate(
            { _id: columnId }, { $pull: { tasks: taskId } }, { new: true, session }
        );

        return plainToInstance(ColumnDto, updatedColumn, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
