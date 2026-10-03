import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { promises as fs } from 'fs';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Attachment, AttachmentDocument } from 'src/schema/Attachment.schema';
import { ATTACHMENTS_DIRECTORY } from './attachment.constants';
import { AttachmentDto } from './dto/response.dto';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Injectable()
export class AttachmentService {
    constructor(
        @InjectModel(Attachment.name) private readonly attachmentModel: Model<AttachmentDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getAttachmentsByTask(taskId: Types.ObjectId) {
        const attachments = await this.attachmentModel
            .find({ taskId: taskId.toString() })
            .populate('authorId', '_id username displayName')
            .sort({ createdAt: 1 });

        return plainToInstance(AttachmentDto, attachments, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async createAttachment(
        taskId: Types.ObjectId,
        projectId: Types.ObjectId,
        file: Express.Multer.File,
        user: UserJwt,
    ) {
        const attachment = await this.attachmentModel.create({
            taskId: taskId.toString(),
            projectId,
            authorId: new Types.ObjectId(user.id),
            originalName: file.originalname,
            storedFilename: file.filename,
            mimeType: file.mimetype,
            size: file.size,
        });

        await attachment.populate('authorId', '_id username displayName');
        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'attachment.uploaded',
            entityType: 'attachment',
            entityId: attachment._id,
            taskId,
            summary: `Uploaded ${attachment.originalName}`,
        });
        return plainToInstance(AttachmentDto, attachment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getAttachmentFile(attachmentId: Types.ObjectId) {
        const attachment = await this.attachmentModel.findById(attachmentId);

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        const filePath = path.resolve(ATTACHMENTS_DIRECTORY, attachment.storedFilename);
        if (!filePath.startsWith(`${ATTACHMENTS_DIRECTORY}${path.sep}`)) {
            throw new NotFoundException('Attachment file not found');
        }

        try {
            await fs.access(filePath);
        } catch {
            throw new NotFoundException('Attachment file not found');
        }

        return { attachment, filePath };
    }

    async deleteAttachment(attachmentId: Types.ObjectId, user: UserJwt, projectId: Types.ObjectId) {
        const attachment = await this.attachmentModel.findById(attachmentId);

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        const filePath = path.resolve(ATTACHMENTS_DIRECTORY, attachment.storedFilename);
        if (filePath.startsWith(`${ATTACHMENTS_DIRECTORY}${path.sep}`)) {
            await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            });
        }

        await attachment.deleteOne();

        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'attachment.deleted',
            entityType: 'attachment',
            entityId: attachment._id,
            taskId: attachment.taskId,
            summary: `Deleted ${attachment.originalName}`,
        });

        return { message: 'Attachment deleted successfully' };
    }
}
