import { ForbiddenException } from '@nestjs/common';
import { AttachmentAccessGuard } from './AttachmentAccessGuard';
import { AttachmentDeleteGuard } from './AttachmentDeleteGuard';
import { AttachmentTaskAccessGuard } from './AttachmentTaskAccessGuard';

const executionContext = (request: Record<string, unknown>) => ({
    switchToHttp: () => ({ getRequest: () => request }),
}) as any;

describe('attachment access guards', () => {
    const projectId = '507f1f77bcf86cd799439011';

    it('allows a project member to access a task attachment and preserves the project context', async () => {
        const taskService = { getProjectIdByTaskId: jest.fn().mockResolvedValue(projectId) };
        const teamService = { isUserMemberInProject: jest.fn().mockResolvedValue(true) };
        const guard = new AttachmentTaskAccessGuard(taskService as any, teamService as any);
        const request = { params: { taskId: '507f1f77bcf86cd799439012' }, user: { id: 'member-id' } };

        await expect(guard.canActivate(executionContext(request))).resolves.toBe(true);
        expect(teamService.isUserMemberInProject).toHaveBeenCalledWith(projectId, 'member-id');
        expect((request as any).attachmentProjectId).toBe(projectId);
    });

    it('rejects a non-member before an attachment can be uploaded', async () => {
        const taskService = { getProjectIdByTaskId: jest.fn().mockResolvedValue(projectId) };
        const teamService = { isUserMemberInProject: jest.fn().mockResolvedValue(false) };
        const guard = new AttachmentTaskAccessGuard(taskService as any, teamService as any);
        const request = { params: { taskId: '507f1f77bcf86cd799439012' }, user: { id: 'outsider-id' } };

        await expect(guard.canActivate(executionContext(request))).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows the uploader to remove their own attachment without an admin lookup', async () => {
        const teamService = { isUserAdminOrOwnerInProject: jest.fn() };
        const guard = new AttachmentDeleteGuard(teamService as any);
        const request = {
            attachment: { authorId: { toString: () => 'uploader-id' } },
            attachmentProjectId: projectId,
            user: { id: 'uploader-id' },
        };

        await expect(guard.canActivate(executionContext(request))).resolves.toBe(true);
        expect(teamService.isUserAdminOrOwnerInProject).not.toHaveBeenCalled();
    });

    it('requires project-admin rights when deleting another member\'s attachment', async () => {
        const teamService = { isUserAdminOrOwnerInProject: jest.fn().mockResolvedValue(false) };
        const guard = new AttachmentDeleteGuard(teamService as any);
        const request = {
            attachment: { authorId: { toString: () => 'uploader-id' } },
            attachmentProjectId: projectId,
            user: { id: 'member-id' },
        };

        await expect(guard.canActivate(executionContext(request))).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('checks membership from attachment metadata before serving a download', async () => {
        const attachment = { projectId, authorId: 'uploader-id' };
        const attachmentModel = {
            findById: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(attachment) }),
        };
        const teamService = { isUserMemberInProject: jest.fn().mockResolvedValue(true) };
        const guard = new AttachmentAccessGuard(attachmentModel as any, teamService as any);
        const request = { params: { attachmentId: '507f1f77bcf86cd799439012' }, user: { id: 'member-id' } };

        await expect(guard.canActivate(executionContext(request))).resolves.toBe(true);
        expect(teamService.isUserMemberInProject).toHaveBeenCalledWith(projectId, 'member-id');
        expect((request as any).attachment).toBe(attachment);
    });
});
