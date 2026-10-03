import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Comment, CommentDocument } from 'src/schema/Comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentDto } from './dto/response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuditLogService } from 'src/audit-log/audit-log.service';

const commentExcerpt = (content: string) => content.length > 160 ? `${content.slice(0, 157)}…` : content;

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
        private readonly auditLogService: AuditLogService,
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

    async createComment(body: CreateCommentDto, user: UserJwt, projectId: Types.ObjectId) {
        const comment = await this.commentModel.create({
            ...body,
            authorId: new Types.ObjectId(user.id),
        });

        await comment.populate('authorId', '_id username displayName avatarUrl');
        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'comment.created',
            entityType: 'comment',
            entityId: comment._id,
            taskId: body.taskId,
            summary: `Commented: “${commentExcerpt(body.contentText)}”`,
        });
        return this.toCommentDto(comment);
    }

    async updateComment(commentId: Types.ObjectId, body: UpdateCommentDto, user: UserJwt, projectId: Types.ObjectId) {
        const comment = await this.commentModel
            .findByIdAndUpdate(commentId, body, { new: true })
            .populate('authorId', '_id username displayName avatarUrl');

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'comment.updated',
            entityType: 'comment',
            entityId: comment._id,
            taskId: comment.taskId,
            summary: `Edited a comment: “${commentExcerpt(comment.contentText)}”`,
            changedFields: Object.keys(body),
        });

        return this.toCommentDto(comment);
    }

    async deleteComment(commentId: Types.ObjectId, user: UserJwt, projectId: Types.ObjectId) {
        const comment = await this.commentModel.findByIdAndDelete(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'comment.deleted',
            entityType: 'comment',
            entityId: comment._id,
            taskId: comment.taskId,
            summary: 'Deleted a comment',
        });

        return { message: 'Comment deleted successfully' };
    }
}
