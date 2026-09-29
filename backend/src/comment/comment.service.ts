import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Comment, CommentDocument } from 'src/schema/Comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentDto } from './dto/response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    ) {}

    private toCommentDto(comment: CommentDocument) {
        const commentDto = plainToInstance(CommentDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });

        // Tiptap documents have dynamic keys, so class-transformer cannot safely
        // apply excludeExtraneousValues to their nested content.
        commentDto.content = comment.content;
        return commentDto;
    }

    async getCommentsByTask(taskId: Types.ObjectId) {
        const comments = await this.commentModel
            .find({ taskId: taskId.toString() })
            .populate('authorId', '_id username displayName avatarUrl')
            .sort({ createdAt: 1 });

        return comments.map((comment) => this.toCommentDto(comment));
    }

    async createComment(body: CreateCommentDto, user: UserJwt) {
        const comment = await this.commentModel.create({
            ...body,
            authorId: new Types.ObjectId(user.id),
        });

        await comment.populate('authorId', '_id username displayName avatarUrl');
        return this.toCommentDto(comment);
    }

    async updateComment(commentId: Types.ObjectId, body: UpdateCommentDto) {
        const comment = await this.commentModel
            .findByIdAndUpdate(commentId, body, { new: true })
            .populate('authorId', '_id username displayName avatarUrl');

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return this.toCommentDto(comment);
    }

    async deleteComment(commentId: Types.ObjectId) {
        const comment = await this.commentModel.findByIdAndDelete(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return { message: 'Comment deleted successfully' };
    }
}
