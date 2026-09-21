import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CheckResourceTaskSource } from 'src/task/decorators/ResourceTaskSource.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentAuthorAccessGuard } from './guards/CommentAuthorAccessGuard';
import { CommentTaskAccessGuard } from './guards/CommentTaskAccessGuard';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @ApiOperation({ summary: 'List comments for a task' })
    @ApiParam({ name: 'taskId', type: String })
    @CheckResourceTaskSource({ source: 'params', key: 'taskId' })
    @UseGuards(CommentTaskAccessGuard)
    @Get('task/:taskId')
    async getCommentsByTask(@Param('taskId', ParseObjectIdPipe) taskId: Types.ObjectId) {
        return this.commentService.getCommentsByTask(taskId);
    }

    @ApiOperation({ summary: 'Create a task comment' })
    @CheckResourceTaskSource({ source: 'body', key: 'taskId' })
    @UseGuards(CommentTaskAccessGuard)
    @Post()
    async createComment(@Body() body: CreateCommentDto, @User() user: UserJwt) {
        return this.commentService.createComment(body, user);
    }

    @ApiOperation({ summary: 'Update your own comment' })
    @ApiParam({ name: 'commentId', type: String })
    @UseGuards(CommentAuthorAccessGuard)
    @Patch(':commentId')
    async updateComment(
        @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
        @Body() body: UpdateCommentDto,
    ) {
        return this.commentService.updateComment(commentId, body);
    }

    @ApiOperation({ summary: 'Delete your own comment' })
    @ApiParam({ name: 'commentId', type: String })
    @UseGuards(CommentAuthorAccessGuard)
    @Delete(':commentId')
    async deleteComment(@Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId) {
        return this.commentService.deleteComment(commentId);
    }
}
