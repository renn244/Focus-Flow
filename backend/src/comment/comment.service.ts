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

    async getCommentsByTask(taskId: Types.ObjectId) {
        const comments = await this.commentModel
            .find({ taskId: taskId.toString() })
            .populate('authorId', '_id username displayName avatarUrl')
            .sort({ createdAt: 1 });

        return plainToInstance(CommentDto, comments, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async createComment(body: CreateCommentDto, user: UserJwt) {
        const comment = await this.commentModel.create({
            ...body,
            authorId: new Types.ObjectId(user.id),
        });

        await comment.populate('authorId', '_id username displayName avatarUrl');
        return plainToInstance(CommentDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updateComment(commentId: Types.ObjectId, body: UpdateCommentDto) {
        const comment = await this.commentModel
            .findByIdAndUpdate(commentId, body, { new: true })
            .populate('authorId', '_id username displayName avatarUrl');

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return plainToInstance(CommentDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteComment(commentId: Types.ObjectId) {
        const comment = await this.commentModel.findByIdAndDelete(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return { message: 'Comment deleted successfully' };
    }
}
