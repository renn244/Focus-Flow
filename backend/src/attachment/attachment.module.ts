import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, attachmentSchema } from 'src/schema/Attachment.schema';
import { TaskModule } from 'src/task/task.module';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { AttachmentAccessGuard } from './guards/AttachmentAccessGuard';
import { AttachmentDeleteGuard } from './guards/AttachmentDeleteGuard';
import { AttachmentTaskAccessGuard } from './guards/AttachmentTaskAccessGuard';

@Module({
    imports: [MongooseModule.forFeature([{ name: Attachment.name, schema: attachmentSchema }]), TaskModule],
    controllers: [AttachmentController],
    providers: [AttachmentService, AttachmentTaskAccessGuard, AttachmentAccessGuard, AttachmentDeleteGuard],
})
export class AttachmentModule {}
