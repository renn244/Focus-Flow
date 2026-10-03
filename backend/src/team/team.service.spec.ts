import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { ProjectsService } from 'src/projects/projects.service';
import { TeamMember } from 'src/schema/TeamMember.schema';
import { UserService } from 'src/user/user.service';
import { TeamGateway } from './team.gateway';
import { TeamService } from './team.service';
import { TeamSharedService } from './team.shared.service';

describe('TeamService member table', () => {
    const memberModel = { aggregate: jest.fn() };
    const teamSharedService = { isUserMemberInProject: jest.fn() };
    const projectId = new Types.ObjectId();
    const user = { id: new Types.ObjectId().toString(), username: 'member' };
    let service: TeamService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({ providers: [TeamService] })
            .useMocker((token) => {
                if (token === getModelToken(TeamMember.name)) return memberModel;
                if (token === TeamSharedService) return teamSharedService;
                if (token === CACHE_MANAGER || token === getConnectionToken()) return {};
                if (token === ProjectsService || token === UserService || token === TeamGateway || token === AuditLogService) return {};
                return {};
            })
            .compile();
        service = module.get(TeamService);
    });

    it('never exposes the table to a user outside the project', async () => {
        teamSharedService.isUserMemberInProject.mockResolvedValue(false);
        await expect(service.getMembersTable(user as any, projectId, {})).rejects.toBeInstanceOf(ForbiddenException);
        expect(memberModel.aggregate).not.toHaveBeenCalled();
    });

    it('scopes search and pagination to the requested project in the database pipeline', async () => {
        teamSharedService.isUserMemberInProject.mockResolvedValue(true);
        memberModel.aggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ items: [{ _id: 'member-1' }], metadata: [{ total: 11 }] }]) });
        const result = await service.getMembersTable(user as any, projectId, { page: 2, limit: 10, search: 'alex.m', sortBy: 'role', sortOrder: 'desc' });

        const pipeline = memberModel.aggregate.mock.calls[0][0];
        expect(JSON.stringify(pipeline)).toContain(projectId.toString());
        expect(JSON.stringify(pipeline)).toContain('alex\\\\.m');
        expect(result).toEqual({ items: [{ _id: 'member-1' }], page: 2, limit: 10, total: 11, totalPages: 2 });
    });
});
