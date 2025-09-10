import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ColumnService } from './column.service';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateColumnDto } from './dto/create-column.dto';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { Types } from 'mongoose';
import { UpdateColumnDto } from './dto/update-column.dto';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ColumnAccessGuard } from './guards/ColumnAccessGuard';
import { ColumnAdminAccessGuard } from './guards/ColumnAdminAccessGuard';
import { CheckResourceColumnSource } from './decorators/ResourceColumnSource.decorator';

@Controller('column')
@UseGuards(JwtAuthGuard)
export class ColumnController {
    constructor(
        private readonly columnService: ColumnService,
    ) {}

    @ApiBearerAuth()
    @Post()
    async createColumn(@Body() body: CreateColumnDto, @User() user: UserJwt) {
        return this.columnService.createColumn(body, user);
    }

    @ApiParam({ name: 'boardId', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Get('byBoard/:boardId')
    async getColumnsByBoardId(@Param('boardId', ParseObjectIdPipe) boardId: Types.ObjectId) {
        return this.columnService.getColumnsByBoardId(boardId);
    }

    @ApiParam({ name: 'id', type: String, description: 'Column Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceColumnSource({ source: 'params', key: 'id' })
    @UseGuards(ColumnAccessGuard)
    @Get(':id')
    async getColumnById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.columnService.getColumnById(id);
    }

    @ApiParam({ name: 'boardId', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Patch('reorder/:boardId')
    async reorderColumns(@Param('boardId', ParseObjectIdPipe) boardId: Types.ObjectId, @Body() body: { columns: { _id: Types.ObjectId, order: number }[] }, @User() user: UserJwt) {
        return this.columnService.updateOrderColumns(boardId, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Column Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceColumnSource({ source: 'params', key: 'id' })
    @UseGuards(ColumnAdminAccessGuard)
    @Patch(':id')
    async updateColumn(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateColumnDto, @User() user: UserJwt) {
        return this.columnService.updateColumn(id, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Column Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceColumnSource({ source: 'params', key: 'id' })
    @UseGuards(ColumnAdminAccessGuard)
    @Delete(':id')
    async deleteColumn(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @User() user: UserJwt) {
        return this.columnService.deleteColumn(id, user);
    }
}
