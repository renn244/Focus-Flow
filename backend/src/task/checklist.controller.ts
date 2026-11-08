import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ChecklistService } from './checklist.service';
import { CheckResourceTaskSource } from './decorators/ResourceTaskSource.decorator';
import { AddChecklistItemsDto, ReorderChecklistDto, UpdateChecklistItemDto } from './dto/checklist.dto';
import { ChecklistItemDto } from './dto/response-dto';
import { TaskAccessGuard } from './guards/TaskAccessGuard';

@ApiTags('Task checklist')
@ApiBearerAuth()
@Controller('task/:id/checklist')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
    constructor(private readonly checklistService: ChecklistService) {}

    @ApiOperation({ summary: 'Add items to a task’s checklist (any project member)' })
    @ApiParam({ name: 'id', type: String, description: 'Task id' })
    @ApiCreatedResponse({ description: 'The whole checklist after the change', type: ChecklistItemDto, isArray: true })
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    @Post()
    async addItems(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: AddChecklistItemsDto, @User() user: UserJwt) {
        return this.checklistService.addItems(id, body, user);
    }

    @ApiOperation({ summary: 'Put the checklist items in a new order' })
    @ApiParam({ name: 'id', type: String, description: 'Task id' })
    @ApiOkResponse({ description: 'The whole checklist after the change', type: ChecklistItemDto, isArray: true })
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    // Declared before ':itemId' so "order" isn't read as an item id.
    @Patch('order')
    async reorder(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: ReorderChecklistDto) {
        return this.checklistService.reorder(id, body);
    }

    @ApiOperation({ summary: 'Rename, check, or uncheck a checklist item' })
    @ApiParam({ name: 'id', type: String, description: 'Task id' })
    @ApiParam({ name: 'itemId', type: String })
    @ApiOkResponse({ description: 'The whole checklist after the change', type: ChecklistItemDto, isArray: true })
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    @Patch(':itemId')
    async updateItem(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @Param('itemId', ParseObjectIdPipe) itemId: Types.ObjectId,
        @Body() body: UpdateChecklistItemDto,
        @User() user: UserJwt,
    ) {
        return this.checklistService.updateItem(id, itemId, body, user);
    }

    @ApiOperation({ summary: 'Remove a checklist item' })
    @ApiParam({ name: 'id', type: String, description: 'Task id' })
    @ApiParam({ name: 'itemId', type: String })
    @ApiOkResponse({ description: 'The whole checklist after the change', type: ChecklistItemDto, isArray: true })
    @CheckResourceTaskSource({ source: 'params', key: 'id' })
    @UseGuards(TaskAccessGuard)
    @Delete(':itemId')
    async removeItem(
        @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
        @Param('itemId', ParseObjectIdPipe) itemId: Types.ObjectId,
        @User() user: UserJwt,
    ) {
        return this.checklistService.removeItem(id, itemId, user);
    }
}
