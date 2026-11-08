import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditLog } from 'src/schema/AuditLog.schema';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
    const projectId = new Types.ObjectId();
    const actorId = new Types.ObjectId();
    const firstId = new Types.ObjectId();
    const secondId = new Types.ObjectId();
    const model = { create: jest.fn(), find: jest.fn() };
    let service: AuditLogService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({ providers: [AuditLogService] })
            .useMocker((token) => token === getModelToken(AuditLog.name) ? model : token === EventEmitter2 ? { emit: jest.fn() } : {})
            .compile();
        service = module.get(AuditLogService);
    });

    it('stores only the event metadata needed for a task change', async () => {
        model.create.mockResolvedValue([{ _id: firstId }]);
        await service.record({ projectId, actorId, action: 'task.updated', entityType: 'task', entityId: secondId, summary: 'Updated task details', changedFields: ['title'] });

        expect(model.create).toHaveBeenCalledWith([expect.objectContaining({
            projectId, actorId, action: 'task.updated', entityId: secondId.toString(), changedFields: ['title'],
        })], { session: undefined });
    });

    it('returns newest records first with a cursor for the next page', async () => {
        const firstLog = { _id: firstId, projectId, actorId: { _id: actorId, username: 'focusflow-qa', displayName: 'FocusFlow QA' }, action: 'task.updated', entityType: 'task', entityId: secondId.toString(), summary: 'Updated task details', changedFields: ['title'], createdAt: new Date() };
        const limit = jest.fn().mockResolvedValue([firstLog, { ...firstLog, _id: secondId }]);
        model.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit }) }) });

        const result = await service.getProjectActivity(projectId, { limit: 1 });
        expect(result.items).toHaveLength(1);
        expect(result.nextCursor).toBe(firstId.toString());
    });
});
