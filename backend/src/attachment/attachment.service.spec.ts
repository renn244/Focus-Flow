import { NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Types } from 'mongoose';
import { AttachmentService } from './attachment.service';

describe('AttachmentService', () => {
    const attachmentModel = {
        findById: jest.fn(),
    };
    const attachmentId = new Types.ObjectId();
    let service: AttachmentService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AttachmentService(attachmentModel as any);
    });

    it('removes the stored file before deleting its metadata', async () => {
        const deleteOne = jest.fn().mockResolvedValue(undefined);
        attachmentModel.findById.mockResolvedValue({ storedFilename: 'stored-file.pdf', deleteOne });
        const unlink = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

        await expect(service.deleteAttachment(attachmentId)).resolves.toEqual({
            message: 'Attachment deleted successfully',
        });

        expect(unlink).toHaveBeenCalledWith(expect.stringContaining('stored-file.pdf'));
        expect(deleteOne).toHaveBeenCalledTimes(1);
    });

    it('does not delete metadata when the attachment does not exist', async () => {
        attachmentModel.findById.mockResolvedValue(null);

        await expect(service.deleteAttachment(attachmentId)).rejects.toBeInstanceOf(NotFoundException);
    });
});
