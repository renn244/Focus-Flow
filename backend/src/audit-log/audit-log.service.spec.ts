import { Types } from 'mongoose';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
    const projectId = new Types.ObjectId();
    const actorId = new Types.ObjectId();
    const firstId = new Types.ObjectId();
    const secondId = new Types.ObjectId();
    let model: { create: jest.Mock; find: jest.Mock };
    let service: AuditLogService;

    beforeEach(() => {
        model = {
            create: jest.fn(),
            find: jest.fn(),
        };
        service = new AuditLogService(model as any);
    });

    it('stores only the event metadata needed for a task change', async () => {
        model.create.mockResolvedValue([{ _id: firstId }]);

        await service.record({
            projectId,
            actorId,
            action: 'task.updated',
            entityType: 'task',
            entityId: secondId,
            summary: 'Updated task details',
            changedFields: ['title'],
        });

        expect(model.create).toHaveBeenCalledWith([
            expect.objectContaining({
                projectId,
                actorId,
                action: 'task.updated',
                entityType: 'task',
                entityId: secondId.toString(),
                summary: 'Updated task details',
                changedFields: ['title'],
            }),
        ], { session: undefined });
    });

    it('returns newest records first with a cursor for the next page', async () => {
        const firstLog = {
            _id: firstId,
            projectId,
            actorId: { _id: actorId, username: 'focusflow-qa', displayName: 'FocusFlow QA' },
            action: 'task.updated',
            entityType: 'task',
            entityId: secondId.toString(),
            summary: 'Updated task details',
            changedFields: ['title'],
            createdAt: new Date(),
        };
        const secondLog = { ...firstLog, _id: secondId };

        const limit = jest.fn().mockResolvedValue([firstLog, secondLog]);
        const sort = jest.fn().mockReturnValue({ limit });
        const populate = jest.fn().mockReturnValue({ sort });
        model.find.mockReturnValue({ populate });

        const result = await service.getProjectActivity(projectId, { limit: 1 });

        expect(model.find).toHaveBeenCalledWith({ projectId });
        expect(sort).toHaveBeenCalledWith({ _id: -1 });
        expect(limit).toHaveBeenCalledWith(2);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].actor.username).toBe('focusflow-qa');
        expect(result.nextCursor).toBe(firstId.toString());
    });
});
