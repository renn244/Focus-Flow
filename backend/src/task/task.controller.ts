import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { MoveTaskDto } from './dto/move-task.dto';

@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
    ) {}

    @ApiBearerAuth()
    @Post()
    async createTask(@Body() body: CreateTaskDto) {
        return this.taskService.createTask(body);
    }

    @ApiParam({ name: 'columnId', type: String, description: 'Column Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Get('byColumn/:columnId')
    async getTaskByColumnId(@Param('columnId', ParseObjectIdPipe) columnId: Types.ObjectId) {
        return this.taskService.getTaskByColumnId(columnId);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Get(':id')
    async getTask(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.taskService.getTask(id);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Patch('moved/:id')
    async moveTask(@Param('id', ParseObjectIdPipe) taskId: Types.ObjectId, @Body() body: MoveTaskDto) {
        return this.taskService.updateMovedTask(taskId, body);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Patch(':id')
    async updateTask(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateTaskDto, @User() user: UserJwt) {
        return this.taskService.updateTask(id, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Delete(':id')
    async deleteTask(@Param('id', ParseObjectIdPipe) taskId: Types.ObjectId) {
        return this.taskService.deleteTask(taskId);
    }
}
