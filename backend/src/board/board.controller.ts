import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { Types } from 'mongoose';
import { BoardAccessGuard } from 'src/lib/guards/BoardAccessGuard';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
    constructor(
        private readonly boardService: BoardService,
    ) {}

    // use ProjectGuard here to ensure the user has access to the project
    @ApiBearerAuth()
    @Post()
    async createBoard(@Body() body: CreateBoardDto, @User() user: UserJwt) {
        return this.boardService.createBoard(body, user);
    }

    // use ProjectGuard here to ensure the user has access to the project
    @ApiParam({ name: 'projectId', type: String, description: 'Project Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @Get('byProject/:projectId')
    async getBoards(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.getBoards(projectId, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @UseGuards(BoardAccessGuard)
    @Get(':id')
    async getBoardById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.getBoardById(id);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @UseGuards(BoardAccessGuard)
    @Patch(':id')
    async updateBoard(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateBoardDto, @User() user: UserJwt) {
        return this.boardService.updateBoard(id, body, user);
    }

    @ApiParam({ name: 'id', type: String, description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @UseGuards(BoardAccessGuard)
    @Delete(':id')
    async deleteBoard(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @User() user: UserJwt) {
        return this.boardService.deleteBoard(id, user);
    }
}
