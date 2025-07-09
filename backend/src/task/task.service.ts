import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from 'src/schema/Task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { ColumnService } from 'src/column/column.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { plainToInstance } from 'class-transformer';
import { TaskDto } from './dto/response-dto';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        private readonly columnService: ColumnService,
    ) {}

    async createTask(body: CreateTaskDto) {
        const newTask = await this.taskModel.create(body);

        return plainToInstance(TaskDto, newTask, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
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

    async getTask(id: Types.ObjectId) {
        const task = await this.taskModel.findById(id);

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return plainToInstance(TaskDto, task, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async updateTask(id: Types.ObjectId, body: UpdateTaskDto, user: UserJwt) {
        const task = await this.taskModel.findById(id);

        if(!task) {
            throw new NotFoundException('Task not found');
        }

        const updatedTask = await this.taskModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        )

        return plainToInstance(TaskDto, updatedTask, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteTask(id: Types.ObjectId) {
        const task = await this.taskModel.deleteOne({ _id: id });

        if(task.deletedCount === 0) {
            throw new NotFoundException("Task not found or you do not have permission to delete this task");
        }

        return { message: "Task deleted successfully" }
    }
}
