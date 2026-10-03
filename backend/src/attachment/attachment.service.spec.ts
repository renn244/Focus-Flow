import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import { Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { Attachment } from 'src/schema/Attachment.schema';
import { AttachmentService } from './attachment.service';

describe('AttachmentService', () => {
    const attachmentModel = { findById: jest.fn() };
    const auditLogService = { record: jest.fn() };
    const attachmentId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const user = { id: new Types.ObjectId().toString(), username: 'alex' };
    let service: AttachmentService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({ providers: [AttachmentService] })
            .useMocker((token) => token === getModelToken(Attachment.name) ? attachmentModel : token === AuditLogService ? auditLogService : {})
            .compile();
        service = module.get(AttachmentService);
    });

    it('removes the stored file, metadata, and records an audit event', async () => {
        const deleteOne = jest.fn().mockResolvedValue(undefined);
        attachmentModel.findById.mockResolvedValue({
            _id: attachmentId, taskId: new Types.ObjectId().toString(), originalName: 'stored-file.pdf',
            storedFilename: 'stored-file.pdf', deleteOne,
        });
        const unlink = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

        await expect(service.deleteAttachment(attachmentId, user as any, projectId)).resolves.toEqual({ message: 'Attachment deleted successfully' });
        expect(unlink).toHaveBeenCalledWith(expect.stringContaining('stored-file.pdf'));
        expect(deleteOne).toHaveBeenCalledTimes(1);
        expect(auditLogService.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'attachment.deleted', projectId, actorId: user.id }));
    });

    it('does not delete metadata when the attachment does not exist', async () => {
        attachmentModel.findById.mockResolvedValue(null);
        await expect(service.deleteAttachment(attachmentId, user as any, projectId)).rejects.toBeInstanceOf(NotFoundException);
    });
});
