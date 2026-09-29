import { BadRequestException, Controller, Delete, Get, Param, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Types } from 'mongoose';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ALLOWED_ATTACHMENT_MIME_TYPES, ATTACHMENTS_DIRECTORY, MAX_ATTACHMENT_SIZE_BYTES } from './attachment.constants';
import { AttachmentService } from './attachment.service';
import { AttachmentDto } from './dto/response.dto';
import { AttachmentAccessGuard } from './guards/AttachmentAccessGuard';
import { AttachmentDeleteGuard } from './guards/AttachmentDeleteGuard';
import { AttachmentTaskAccessGuard } from './guards/AttachmentTaskAccessGuard';
import { createReadStream } from 'fs';

mkdirSync(ATTACHMENTS_DIRECTORY, { recursive: true });

const attachmentUpload = FileInterceptor('file', {
    storage: diskStorage({
        destination: ATTACHMENTS_DIRECTORY,
        filename: (_request, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `${randomUUID()}${extension}`);
        },
    }),
    limits: { fileSize: MAX_ATTACHMENT_SIZE_BYTES, files: 1 },
    fileFilter: (_request, file, callback) => {
        if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
            callback(new BadRequestException('This file type is not allowed'), false);
            return;
        }

        callback(null, true);
    },
});

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachment')
@UseGuards(JwtAuthGuard)
export class AttachmentController {
    constructor(private readonly attachmentService: AttachmentService) {}

    @ApiOperation({ summary: 'List attachments for a task' })
    @ApiParam({ name: 'taskId', type: String })
    @ApiOkResponse({ description: 'Attachments visible to the signed-in project member', type: AttachmentDto, isArray: true })
    @UseGuards(AttachmentTaskAccessGuard)
    @Get('task/:taskId')
    async getAttachments(@Param('taskId', ParseObjectIdPipe) taskId: Types.ObjectId) {
        return this.attachmentService.getAttachmentsByTask(taskId);
    }

    @ApiOperation({ summary: 'Upload an attachment to a task' })
    @ApiParam({ name: 'taskId', type: String })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiCreatedResponse({ description: 'Attachment metadata', type: AttachmentDto })
    @UseGuards(AttachmentTaskAccessGuard)
    @UseInterceptors(attachmentUpload)
    @Post('task/:taskId')
    async uploadAttachment(
        @Param('taskId', ParseObjectIdPipe) taskId: Types.ObjectId,
        @UploadedFile() file: Express.Multer.File | undefined,
        @Req() request: { attachmentProjectId: Types.ObjectId },
        @User() user: UserJwt,
    ) {
        if (!file) {
            throw new BadRequestException('A file is required');
        }

        return this.attachmentService.createAttachment(taskId, request.attachmentProjectId, file, user);
    }

    @ApiOperation({ summary: 'Download an attachment' })
    @ApiParam({ name: 'attachmentId', type: String })
    @ApiOkResponse({
        description: 'Attachment file stream',
        content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } },
    })
    @UseGuards(AttachmentAccessGuard)
    @Get(':attachmentId/download')
    async downloadAttachment(
        @Param('attachmentId', ParseObjectIdPipe) attachmentId: Types.ObjectId,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { attachment, filePath } = await this.attachmentService.getAttachmentFile(attachmentId);
        response.type(attachment.mimeType);
        response.attachment(attachment.originalName);
        return new StreamableFile(createReadStream(filePath));
    }

    @ApiOperation({ summary: 'Delete your attachment or any attachment as a project admin' })
    @ApiParam({ name: 'attachmentId', type: String })
    @ApiOkResponse({ description: 'Attachment deleted successfully' })
    @UseGuards(AttachmentAccessGuard, AttachmentDeleteGuard)
    @Delete(':attachmentId')
    async deleteAttachment(@Param('attachmentId', ParseObjectIdPipe) attachmentId: Types.ObjectId) {
        return this.attachmentService.deleteAttachment(attachmentId);
    }
}
