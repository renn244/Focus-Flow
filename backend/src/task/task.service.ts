import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { TeamService } from 'src/team/team.service';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { Column, ColumnDocument } from 'src/schema/Column.schema';
import { User, UserDocument } from 'src/schema/User.schema';
import { TeamSharedService } from 'src/team/team.shared.service';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { GetProjectActivityQueryDto } from 'src/audit-log/dto/get-project-activity-query.dto';
import { AuditChange } from 'src/schema/AuditLog.schema';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
        @InjectModel(Column.name) private readonly columnModel: Model<ColumnDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly teamGateway: TeamGateway,
        private readonly teamService: TeamService,
        private readonly columnService: ColumnService,
        private readonly teamSharedService: TeamSharedService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async createTask(body: CreateTaskDto, user: UserJwt) {
        await this.validateAssignee(body.boardId, body.assignee);
        const board = await this.boardModel.findById(body.boardId).select('projectId');

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        const session = await this.connection.startSession();
        session.startTransaction();
        
        try {
            const newTask = await this.taskModel.create([body], { session });
            await this.columnService.addTaskToColumn(body.columnId, newTask[0]._id, session)
            await this.auditLogService.record({
                projectId: board.projectId,
                actorId: user.id,
                action: 'task.created',
                entityType: 'task',
                entityId: newTask[0]._id,
                taskId: newTask[0]._id,
                summary: 'Created a task',
            }, session);
            
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

    async getTasksByProject(projectId: Types.ObjectId) {
        // Refs are stored as ObjectIds in older documents and strings in newer ones.
        // $expr skips Mongoose casting, so comparing as strings matches both forms.
        const boards = await this.boardModel
            .find({ $expr: { $eq: [{ $toString: '$projectId' }, projectId.toString()] } })
            .select('_id');
        const boardIds = boards.map((board) => board._id);

        if (boardIds.length === 0) {
            return [];
        }

        const tasks = await this.taskModel
            .find({ $expr: { $in: [{ $toString: '$boardId' }, boardIds.map(String)] } })
            .populate([
                { path: 'columnId', select: 'title color _id' },
                { path: 'boardId', select: 'name projectId _id' },
                { path: 'assignee', select: 'displayName username avatarUrl _id' },
            ])
            .sort({ dueDate: 1, createdAt: -1 });

        return plainToInstance(TaskWithBoardAndColumnDto, tasks, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getMyTasks(user: UserJwt) {
        const projectIds = await this.teamService.getProjectIdsByMemberId(new Types.ObjectId(user.id));

        if (projectIds.length === 0) {
            return [];
        }

        const boards = await this.boardModel.find({
            $expr: { $in: [{ $toString: '$projectId' }, projectIds.map((projectId) => projectId.toString())] },
        }).select('_id');
        const boardIds = boards.map((board) => board._id);

        if (boardIds.length === 0) {
            return [];
        }

        const tasks = await this.taskModel
            // Compare as strings so refs stored either as ObjectIds or strings match.
            .find({
                $expr: {
                    $and: [
                        { $eq: [{ $toString: '$assignee' }, user.id] },
                        { $in: [{ $toString: '$boardId' }, boardIds.map(String)] },
                    ],
                },
            })
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
        const task = await this.taskModel
            .findById(id)
            .populate('columnId', 'title color _id')
            .populate('boardId', 'name _id')
            .populate('assignee', 'displayName username avatarUrl _id');

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

    async getTaskActivity(taskId: Types.ObjectId, query: GetProjectActivityQueryDto) {
        return this.auditLogService.getTaskActivity(taskId, query);
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
        const { updatedTask, projectId } = await this.connection.transaction(async (session) => {
            // Operations on a transaction session must run sequentially.
            const currentColumn = await this.columnModel.findById(body.taskCurrentColumnId)
                .select('title').session(session);
            const futureColumn = await this.columnModel.findById(body.taskFutureColumnId)
                .select('title').session(session);

            if (!currentColumn || !futureColumn) {
                throw new NotFoundException('Column not found');
            }
            const task = await this.taskModel.findById(taskId).select('boardId columnId').session(session);
            if (!task) {
                throw new NotFoundException('Task not found');
            }
            const board = await this.boardModel.findById(task.boardId).select('projectId columns').session(session);
            if (!board) {
                throw new NotFoundException('Board not found');
            }
            if (![body.taskCurrentColumnId, body.taskFutureColumnId].every((id) =>
                board.columns.some((columnId) => columnId.toString() === id))) {
                throw new BadRequestException('Tasks must be moved between columns of the same board');
            }

            const updatedTask = await this.taskModel.findOneAndUpdate(
                { _id: taskId, columnId: body.taskCurrentColumnId, boardId: task.boardId },
                { columnId: body.taskFutureColumnId }, { new: true, session }
            );
            
            if(!updatedTask) {
                throw new ConflictException('Task is no longer in the source column. Refresh the board and try again.');
            }
            
            await this.columnService.removeTaskFromColumn(body.taskCurrentColumnId.toString(), taskId, session);
            await this.columnService.addTaskToColumn(body.taskFutureColumnId.toString(), taskId, session);

            await this.auditLogService.record({
                projectId: board.projectId,
                actorId: user.id,
                action: 'task.moved',
                entityType: 'task',
                entityId: updatedTask._id,
                taskId: updatedTask._id,
                summary: `Moved task from ${currentColumn?.title ?? 'a column'} to ${futureColumn?.title ?? 'a column'}`,
                changedFields: ['columnId'],
                changes: [{ field: 'Status', from: currentColumn?.title ?? 'Unknown', to: futureColumn?.title ?? 'Unknown' }],
            }, session);

            return { updatedTask, projectId: board.projectId.toString() };
        });

        updatedTask.$session(null);
        const populatedData = await updatedTask.populate([
            { path: 'columnId', select: 'title color _id' },
            { path: 'boardId', select: 'name _id' }
        ]);

        this.teamGateway.io.to(projectId).emit('taskMoved', {
            ...body,
            updatorUserId: user.id,
            task: plainToInstance(TaskWithBoardAndColumnDto, populatedData, {
                excludeExtraneousValues: true, enableImplicitConversion: true
            })
        });

        return { message: "Task moved successfully" };
    }

    async updateTask(id: Types.ObjectId, body: UpdateTaskDto, user: UserJwt) {
        const existingTask = await this.taskModel.findById(id).select('boardId title description priority assignee dueDate tags');

        if (!existingTask) {
            throw new NotFoundException('Task not found');
        }

        if (body.assignee !== undefined) {
            await this.validateAssignee(existingTask.boardId.toString(), body.assignee);
        }

        const updatedTask = await this.taskModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        )

        if(!updatedTask) {
            throw new NotFoundException('Task not found');
        }

        const board = await this.boardModel.findById(existingTask.boardId).select('projectId');
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        const changes = await this.getTaskChanges(existingTask, updatedTask, body);
        if (changes.length > 0) {
            await this.auditLogService.record({
                projectId: board.projectId,
                actorId: user.id,
                action: 'task.updated',
                entityType: 'task',
                entityId: updatedTask._id,
                taskId: updatedTask._id,
                summary: this.getTaskUpdateSummary(body),
                changedFields: changes.map((change) => change.field),
                changes,
            });
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

            const board = await this.boardModel.findById(deletedTask.boardId).select('projectId');
            if (!board) {
                throw new NotFoundException('Board not found');
            }

            await this.auditLogService.record({
                projectId: board.projectId,
                actorId: user.id,
                action: 'task.deleted',
                entityType: 'task',
                entityId: deletedTask._id,
                taskId: deletedTask._id,
                summary: 'Deleted a task',
            }, session);
       
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

    private getTaskUpdateSummary(body: UpdateTaskDto) {
        if (Object.keys(body).length === 1 && body.assignee !== undefined) {
            return body.assignee ? 'Changed task assignee' : 'Unassigned task';
        }

        return 'Updated task details';
    }

    private async getTaskChanges(existingTask: TaskDocument, updatedTask: TaskDocument, body: UpdateTaskDto): Promise<AuditChange[]> {
        const changes = await Promise.all(Object.keys(body).map(async (field) => ({
            field: this.taskFieldLabel(field),
            from: await this.formatTaskAuditValue(field, existingTask.get(field)),
            to: await this.formatTaskAuditValue(field, updatedTask.get(field)),
        })));

        return changes.filter((change) => change.from !== change.to);
    }

    private taskFieldLabel(field: string) {
        return ({
            title: 'Title', description: 'Description', priority: 'Priority', assignee: 'Assignee',
            dueDate: 'Due date', tags: 'Tags', order: 'Order',
        } as Record<string, string>)[field] ?? field;
    }

    private async formatTaskAuditValue(field: string, value: unknown): Promise<string> {
        if (field === 'assignee') {
            if (!value) return 'Unassigned';
            const user = await this.userModel.findById(value).select('displayName username');
            return user?.displayName || user?.username || 'Unknown member';
        }

        if (field === 'dueDate') return value ? new Date(value as string | Date).toLocaleDateString('en-CA') : 'No due date';
        if (field === 'tags') return Array.isArray(value) && value.length > 0 ? value.join(', ') : 'No tags';
        if (field === 'description') return value ? this.truncateAuditValue(String(value)) : 'No description';
        return value === undefined || value === null || value === '' ? 'Not set' : String(value);
    }

    private truncateAuditValue(value: string) {
        return value.length > 100 ? `${value.slice(0, 97)}…` : value;
    }
}
