import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TaskService } from './task.service';

describe('Task move transaction', () => {
    const taskId = new Types.ObjectId();
    const boardId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const source = new Types.ObjectId();
    const destination = new Types.ObjectId();
    const body = { taskCurrentColumnId: source.toString(), taskFutureColumnId: destination.toString() };
    const user = { id: new Types.ObjectId().toString(), username: 'qa' };
    let service: TaskService;
    let session: object;
    let taskModel: any;
    let columnModel: any;
    let boardModel: any;
    let columnService: any;
    let auditLog: any;
    let connection: any;
    let gateway: any;
    let updatedTask: any;
    let sourceQuery: any;
    let destinationQuery: any;

    const query = (value: unknown) => ({ select: jest.fn().mockReturnThis(), session: jest.fn().mockResolvedValue(value) });

    beforeEach(() => {
        session = {};
        updatedTask = { _id: taskId, boardId, $session: jest.fn(), populate: jest.fn().mockResolvedValue({}) };
        taskModel = {
            findById: jest.fn().mockReturnValue(query({ _id: taskId, boardId, columnId: source })),
            findOneAndUpdate: jest.fn().mockResolvedValue(updatedTask),
        };
        sourceQuery = query({ title: 'To Do' });
        destinationQuery = query({ title: 'Done' });
        columnModel = { findById: jest.fn().mockReturnValueOnce(sourceQuery).mockReturnValueOnce(destinationQuery) };
        boardModel = { findById: jest.fn().mockReturnValue(query({ projectId, columns: [source, destination] })) };
        columnService = { removeTaskFromColumn: jest.fn(), addTaskToColumn: jest.fn() };
        auditLog = { record: jest.fn() };
        gateway = { io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };
        connection = { transaction: jest.fn(async (callback) => callback(session)) };
        service = new TaskService(taskModel, boardModel, columnModel, {} as any, connection, gateway, {} as any, columnService, {} as any, auditLog);
    });

    it('runs column queries sequentially on the same session and emits only after commit', async () => {
        let resolveSource!: (value: unknown) => void;
        sourceQuery.session.mockReturnValue(new Promise((resolve) => { resolveSource = resolve; }));
        const pending = service.updateMovedTask(taskId, body, user as any);
        expect(columnModel.findById).toHaveBeenCalledTimes(1);
        expect(gateway.io.to).not.toHaveBeenCalled();
        resolveSource({ title: 'To Do' });
        await expect(pending).resolves.toEqual({ message: 'Task moved successfully' });
        expect(sourceQuery.session).toHaveBeenCalledWith(session);
        expect(destinationQuery.session).toHaveBeenCalledWith(session);
        expect(taskModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: taskId, columnId: source.toString(), boardId },
            { columnId: destination.toString() }, { new: true, session },
        );
        expect(columnService.removeTaskFromColumn).toHaveBeenCalledWith(source.toString(), taskId, session);
        expect(columnService.addTaskToColumn).toHaveBeenCalledWith(destination.toString(), taskId, session);
        expect(auditLog.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'task.moved' }), session);
        expect(updatedTask.$session).toHaveBeenCalledWith(null);
        expect(gateway.io.to).toHaveBeenCalledWith(projectId.toString());
    });

    it('does not publish a move if committing the transaction fails', async () => {
        const error = new Error('Commit failed');
        connection.transaction.mockImplementation(async (callback) => { await callback(session); throw error; });
        await expect(service.updateMovedTask(taskId, body, user as any)).rejects.toThrow(error);
        expect(updatedTask.populate).not.toHaveBeenCalled();
        expect(gateway.io.to).not.toHaveBeenCalled();
    });

    it('rejects a destination outside the task board before writing', async () => {
        boardModel.findById.mockReturnValue(query({ projectId, columns: [source] }));
        await expect(service.updateMovedTask(taskId, body, user as any)).rejects.toBeInstanceOf(BadRequestException);
        expect(taskModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects missing columns before writing', async () => {
        destinationQuery.session.mockResolvedValue(null);
        await expect(service.updateMovedTask(taskId, body, user as any)).rejects.toBeInstanceOf(NotFoundException);
        expect(taskModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects a stale source column without changing column membership or activity', async () => {
        taskModel.findOneAndUpdate.mockResolvedValue(null);
        await expect(service.updateMovedTask(taskId, body, user as any)).rejects.toBeInstanceOf(ConflictException);
        expect(columnService.removeTaskFromColumn).not.toHaveBeenCalled();
        expect(auditLog.record).not.toHaveBeenCalled();
        expect(gateway.io.to).not.toHaveBeenCalled();
    });

    it('propagates audit failures to the transaction helper without publishing', async () => {
        auditLog.record.mockRejectedValue(new Error('Audit unavailable'));
        await expect(service.updateMovedTask(taskId, body, user as any)).rejects.toThrow('Audit unavailable');
        expect(gateway.io.to).not.toHaveBeenCalled();
    });
});
