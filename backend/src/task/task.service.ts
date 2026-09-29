import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Task, TaskDocument } from 'src/schema/Task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { ColumnService } from 'src/column/column.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { plainToInstance } from 'class-transformer';
import { TaskDto, TaskWithBoardAndColumnDto } from './dto/response-dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TeamGateway } from 'src/team/team.gateway';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { TeamSharedService } from 'src/team/team.shared.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly teamGateway: TeamGateway,
        private readonly columnService: ColumnService,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    async createTask(body: CreateTaskDto, user: UserJwt) {
        await this.validateAssignee(body.boardId, body.assignee);
        const session = await this.connection.startSession();
        session.startTransaction();
        
        try {
            const newTask = await this.taskModel.create([body], { session });
            await this.columnService.addTaskToColumn(body.columnId, newTask[0]._id, session)
            
            await session.commitTransaction();

            const populatedData = await newTask[0].populate([
                { path: 'columnId', select: 'title color _id' },
                { path: 'boardId', select: 'name _id' }
            ]);

            const projectId = this.teamGateway.getProjectIdByUserId(user.id);
            this.teamGateway.io.to(projectId).emit('taskCreated', 
                plainToInstance(TaskWithBoardAndColumnDto, populatedData, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                })
            );

            return plainToInstance(TaskDto, newTask[0], {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        } catch (error) {
            await session.abortTransaction();
            throw error; // Re-throw the error to be handled by the filter
        } finally {
            session.endSession();
        }
    }

    async getTaskByColumnId(boardId: Types.ObjectId) {
        const taskIds = await this.columnService.getTasksId(boardId);

        if (!taskIds || taskIds.length === 0) {
            return [];
        }

        const tasks = await this.taskModel.find({ _id: { $in: taskIds } });

        return plainToInstance(TaskDto, tasks, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getMyTasks(user: UserJwt) {
        const tasks = await this.taskModel
            .find({ assignee: new Types.ObjectId(user.id) })
            .populate([
                { path: 'columnId', select: 'title color _id' },
                { path: 'boardId', select: 'name projectId _id' },
            ])
            .sort({ dueDate: 1, createdAt: -1 });

        return plainToInstance(TaskWithBoardAndColumnDto, tasks, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getTask(id: Types.ObjectId) {
        const task = await this.taskModel.findById(id).populate('columnId', 'title color _id').populate('boardId', 'name _id');

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return plainToInstance(TaskWithBoardAndColumnDto, task, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async validateTaskInProject(taskId: Types.ObjectId, projectId: Types.ObjectId) {
        const task = await this.taskModel.findOne({ _id: taskId })
            .populate<{ boardId: { projectId: Types.ObjectId } }>('boardId', 'projectId')

        if(!task) {
            throw new NotFoundException('Task not found');
        }

        if(task.boardId.projectId.toString() !== projectId.toString()) {
            return false;
        }

        return true;
    }

    async getProjectIdByTaskId(taskId: Types.ObjectId | string) {
        const task = await this.taskModel.findById(taskId).select('boardId');

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const board = await this.boardModel.findById(task.boardId).select('projectId');

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return board.projectId;
    }

    async updateMovedTask(taskId: Types.ObjectId, body: MoveTaskDto, user: UserJwt) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const updatedTask = await this.taskModel.findOneAndUpdate(
                { _id: taskId }, { columnId: body.taskFutureColumnId }, { new: true, session }
            );
            
            if(!updatedTask) {
                throw new NotFoundException('Task not found');
            }
            
            await this.columnService.removeTaskFromColumn(body.taskCurrentColumnId.toString(), taskId, session);
            await this.columnService.addTaskToColumn(body.taskFutureColumnId.toString(), taskId, session);

            await session.commitTransaction();
            
            const populatedData = await updatedTask.populate([
                { path: 'columnId', select: 'title color _id' },
                { path: 'boardId', select: 'name _id' }
            ])

            const projectId = this.teamGateway.getProjectIdByUserId(user.id);
            this.teamGateway.io.to(projectId).emit('taskMoved',
                { 
                    ...body, 
                    updatorUserId: user.id,
                    task: plainToInstance(TaskWithBoardAndColumnDto, populatedData, { 
                        excludeExtraneousValues: true, enableImplicitConversion: true 
                    }) 
                }
            );

            return { message: "Task moved successfully" };
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async updateTask(id: Types.ObjectId, body: UpdateTaskDto, user: UserJwt) {
        if (body.assignee !== undefined) {
            const existingTask = await this.taskModel.findById(id).select('boardId');

            if (!existingTask) {
                throw new NotFoundException('Task not found');
            }

            await this.validateAssignee(existingTask.boardId.toString(), body.assignee);
        }

        const updatedTask = await this.taskModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        )

        if(!updatedTask) {
            throw new NotFoundException('Task not found');
        }

        const populatedData = await updatedTask.populate([
            { path: 'columnId', select: 'title color _id' },
            { path: 'boardId', select: 'name _id' }
        ]);

        const projectId = this.teamGateway.getProjectIdByUserId(user.id);
        this.teamGateway.io.to(projectId).emit('taskUpdated', 
            plainToInstance(TaskWithBoardAndColumnDto, populatedData, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            })
        );

        return plainToInstance(TaskDto, updatedTask, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteTask(id: Types.ObjectId, user: UserJwt) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const deletedTask = await this.taskModel.findByIdAndDelete(id, { session });

            if(!deletedTask) {
                throw new NotFoundException("Task not found or you do not have permission to delete this task");
            }

            await this.columnService.removeTaskFromColumn(deletedTask.columnId.toString(), deletedTask._id, session);
       
            await session.commitTransaction();

            const projectId = this.teamGateway.getProjectIdByUserId(user.id);
            this.teamGateway.io.to(projectId).emit('taskDeleted', { taskId: id, colId: deletedTask.columnId.toString() });

            return { message: "Task deleted successfully" };
        } catch (error) {
            await session.abortTransaction();
            throw error; // Re-throw the error to be handled by the filter
        } finally {
            session.endSession();
        }
    }

    private async validateAssignee(boardId: string, assignee?: string) {
        if (!assignee) {
            return;
        }

        const board = await this.boardModel.findById(boardId).select('projectId');

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        const isProjectMember = await this.teamSharedService.isUserMemberInProject(board.projectId, assignee);

        if (!isProjectMember) {
            throw new BadRequestException('Assignee must be a member of this project');
        }
    }
}
