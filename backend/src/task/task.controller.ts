import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { MoveTaskDto } from './dto/move-task.dto';
import { CheckResourceTaskSource } from './decorators/ResourceTaskSource.decorator';
import { TaskAdminAccessGuard } from './guards/TaskAdminAccessGuard';
import { TaskAccessGuard } from './guards/TaskAccessGuard';
import { CheckResourceColumnSource } from 'src/column/decorators/ResourceColumnSource.decorator';
import { ColumnAdminAccessGuard } from 'src/column/guards/ColumnAdminAccessGuard';
import { GetProjectActivityQueryDto } from 'src/audit-log/dto/get-project-activity-query.dto';
import { ProjectActivityPageDto } from 'src/audit-log/dto/response.dto';
import { CheckResourceProjectSource } from 'src/projects/decorators/ResourceProjectSource.decorator';
import { ProjectAccessGuard } from 'src/projects/guards/ProjectAccessGuard';
import { TaskWithBoardAndColumnDto } from './dto/response-dto';

@ApiTags('Tasks')
@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
    ) {}

    @ApiBearerAuth()
    @CheckResourceColumnSource({ source: 'body', key: 'columnId' })
    @UseGuards(ColumnAdminAccessGuard)
    @Post()
    async createTask(@Body() body: CreateTaskDto, @User() user: UserJwt) {
        return this.taskService.createTask(body, user);
    }

    @ApiParam({ name: 'columnId', type: String, description: 'Column Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceColumnSource({ source: 'params', key: 'columnId' })
    @UseGuards(ColumnAdminAccessGuard)
    @Get('byColumn/:columnId')
    async getTaskByColumnId(@Param('columnId', ParseObjectIdPipe) columnId: Types.ObjectId) {
        return this.taskService.getTaskByColumnId(columnId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get every task in a project for the calendar view' })
    @ApiOkResponse({ type: TaskWithBoardAndColumnDto, isArray: true })
    @ApiParam({ name: 'projectId', type: String, description: 'Project Id (ObjectId)' })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(ProjectAccessGuard)
    @Get('byProject/:projectId')
    async getTasksByProject(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.taskService.getTasksByProject(projectId);
    }

    @ApiBearerAuth()
    @Get('mine')
    async getMyTasks(@User() user: UserJwt) {
        return this.taskService.getMyTasks(user);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get activity history for one task' })
    @ApiOkResponse({ type: ProjectActivityPageDto })
    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)' })
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    @Get(':id/activity')
    async getTaskActivity(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @Query() query: GetProjectActivityQueryDto,
    ) {
        return this.taskService.getTaskActivity(id, query);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    @Get(':id')
    async getTask(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.taskService.getTask(id);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAdminAccessGuard)
    @Patch('moved/:id')
    async moveTask(@Param('id', ParseObjectIdPipe) taskId: Types.ObjectId, @Body() body: MoveTaskDto, @User() user: UserJwt) {
        return this.taskService.updateMovedTask(taskId, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAdminAccessGuard)
    @Patch(':id')
    async updateTask(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateTaskDto, @User() user: UserJwt) {
        return this.taskService.updateTask(id, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Task Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAdminAccessGuard)
    @Delete(':id')
    async deleteTask(@Param('id', ParseObjectIdPipe) taskId: Types.ObjectId, @User() user: UserJwt) {
        return this.taskService.deleteTask(taskId, user);
    }
}
