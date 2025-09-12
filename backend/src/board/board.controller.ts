import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardAdminAccessGuard } from './guards/BoardAdminAccessGuard';
import { BoardAccessGuard } from './guards/BoardAccessGuard';
import { CheckResourceBoardSource } from './decorators/ResourceBoardSource.decorator';
import { ProjectAccessGuard } from 'src/projects/guards/ProjectAccessGuard';
import { CheckResourceProjectSource } from 'src/projects/decorators/ResourceProjectSource.decorator';
import { ProjectAdminAccessGuard } from 'src/projects/guards/ProjectAdminAccessGuard';

@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
    constructor(
        private readonly boardService: BoardService,
    ) {}

    @ApiBearerAuth()
    @CheckResourceProjectSource({ source: 'body', key: 'projectId' })
    @UseGuards(ProjectAdminAccessGuard)
    @Post()
    async createBoard(@Body() body: CreateBoardDto, @User() user: UserJwt) {
        return this.boardService.createBoard(body, user);
    }

    @ApiParam({ name: 'projectId', type: String, description: 'Project Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(ProjectAccessGuard)
    @Get('byProject/:projectId')
    async getBoards(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.getBoards(projectId, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceBoardSource({ source: 'params', key: 'id' })
    @UseGuards(BoardAccessGuard)
    @Get(':id')
    async getBoardById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.getBoardById(id);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceBoardSource({ source: 'params', key: 'id' })
    @UseGuards(BoardAdminAccessGuard)
    @Patch(':id')
    async updateBoard(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateBoardDto, @User() user: UserJwt) {
        return this.boardService.updateBoard(id, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceBoardSource({ source: 'params', key: 'id' })
    @UseGuards(BoardAdminAccessGuard)
    @Delete(':id')
    async deleteBoard(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.deleteBoard(id, user);
    }
}
