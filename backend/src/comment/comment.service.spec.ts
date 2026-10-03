import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { Comment } from 'src/schema/Comment.schema';
import { CommentService } from './comment.service';

describe('CommentService', () => {
    const commentModel = { create: jest.fn() };
    const auditLogService = { record: jest.fn() };
    let service: CommentService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({ providers: [CommentService] })
            .useMocker((token) => token === getModelToken(Comment.name) ? commentModel : token === AuditLogService ? auditLogService : {})
            .compile();
        service = module.get(CommentService);
    });

    it('records a concise, attributable audit event when a comment is created', async () => {
        const commentId = new Types.ObjectId();
        const taskId = new Types.ObjectId().toString();
        const projectId = new Types.ObjectId();
        const actorId = new Types.ObjectId().toString();
        const comment = {
            _id: commentId, taskId, content: { type: 'doc', content: [] },
            contentText: 'Decision: ship the task detail improvements after checking the calendar behavior.',
            authorId: { _id: actorId, username: 'alex', displayName: 'Alex Morgan' },
            createdAt: new Date(), updatedAt: new Date(), populate: jest.fn(),
        };
        comment.populate.mockResolvedValue(comment);
        commentModel.create.mockResolvedValue(comment);

        await service.createComment({ taskId, content: comment.content, contentText: comment.contentText }, { id: actorId, username: 'alex' } as any, projectId);
        expect(auditLogService.record).toHaveBeenCalledWith(expect.objectContaining({
            projectId, actorId, action: 'comment.created', entityId: commentId, taskId,
            summary: expect.stringContaining('Decision: ship the task detail improvements'),
        }));
    });
});
