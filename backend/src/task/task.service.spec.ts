import { BadRequestException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { ColumnService } from 'src/column/column.service';
import { Board } from 'src/schema/Board.schema';
import { Column } from 'src/schema/Column.schema';
import { Task } from 'src/schema/Task.schema';
import { User } from 'src/schema/User.schema';
import { TeamGateway } from 'src/team/team.gateway';
import { TeamService } from 'src/team/team.service';
import { TeamSharedService } from 'src/team/team.shared.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
    const user = { id: new Types.ObjectId().toString(), username: 'owner' };
    const taskModel = { find: jest.fn(), findById: jest.fn(), findOneAndUpdate: jest.fn() };
    const boardModel = { find: jest.fn(), findById: jest.fn() };
    const teamSharedService = { isUserMemberInProject: jest.fn() };
    const teamService = { getProjectIdsByMemberId: jest.fn() };
    let service: TaskService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({ providers: [TaskService] })
            .useMocker((token) => {
                if (token === getModelToken(Task.name)) return taskModel;
                if (token === getModelToken(Board.name)) return boardModel;
                if (token === getModelToken(Column.name) || token === getModelToken(User.name) || token === getConnectionToken()) return {};
                if (token === TeamSharedService) return teamSharedService;
                if (token === TeamService) return teamService;
                if (token === TeamGateway || token === ColumnService || token === AuditLogService) return {};
                return {};
            })
            .compile();
        service = module.get(TaskService);
    });

    it('returns an empty calendar set without querying tasks when the project has no boards', async () => {
        boardModel.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
        await expect(service.getTasksByProject(new Types.ObjectId())).resolves.toEqual([]);
        expect(taskModel.find).not.toHaveBeenCalled();
    });

    it('rejects an assignee who is not a member of the task project before updating the task', async () => {
        const taskId = new Types.ObjectId();
        const boardId = new Types.ObjectId();
        const projectId = new Types.ObjectId();
        const outsiderId = new Types.ObjectId().toString();
        taskModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ boardId, get: jest.fn() }) });
        boardModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ projectId }) });
        teamSharedService.isUserMemberInProject.mockResolvedValue(false);

        await expect(service.updateTask(taskId, { assignee: outsiderId }, user as any)).rejects.toBeInstanceOf(BadRequestException);
        expect(teamSharedService.isUserMemberInProject).toHaveBeenCalledWith(projectId, outsiderId);
        expect(taskModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('does not return assigned tasks from projects the user no longer belongs to', async () => {
        teamService.getProjectIdsByMemberId.mockResolvedValue([]);

        await expect(service.getMyTasks(user as any)).resolves.toEqual([]);

        expect(boardModel.find).not.toHaveBeenCalled();
        expect(taskModel.find).not.toHaveBeenCalled();
    });
});
