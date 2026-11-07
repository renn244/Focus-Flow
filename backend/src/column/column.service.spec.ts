import { Types } from 'mongoose';
import { ColumnService } from './column.service';

describe('ColumnService task membership', () => {
    it('adds a task without duplicates using the supplied transaction session', async () => {
        const taskId = new Types.ObjectId();
        const columnId = new Types.ObjectId().toString();
        const session = {} as any;
        const model = { findOneAndUpdate: jest.fn().mockResolvedValue({}) };
        const service = new ColumnService({} as any, {} as any, model as any, {} as any);
        await service.addTaskToColumn(columnId, taskId, session);
        expect(model.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: columnId }, { $addToSet: { tasks: taskId } }, { new: true, session },
        );
    });
});
