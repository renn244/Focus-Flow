import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ColumnService } from './column.service';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateColumnDto } from './dto/create-column.dto';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { Types } from 'mongoose';
import { UpdateColumnDto } from './dto/update-column.dto';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';

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

    @ApiBearerAuth()
    @Get('byBoard/:boardId')
    async getColumnsByBoardId(@Param('boardId', ParseObjectIdPipe) boardId: Types.ObjectId) {
        return this.columnService.getColumnsByBoardId(boardId);
    }

    @ApiBearerAuth()
    @Get(':id')
    async getColumnById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.columnService.getColumnById(id);
    }

    @ApiBearerAuth()
    @Patch(':id')
    async updateColumn(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateColumnDto) {
        return this.columnService.updateColumn(id, body);
    }

    @ApiBearerAuth()
    @Delete(':id')
    async deleteColumn(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.columnService.deleteColumn(id);
    }
}
