import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Attachment {
    @Prop({ type: String, ref: 'Task', required: true, index: true })
    taskId: string;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
    projectId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    authorId: Types.ObjectId;

    @Prop({ required: true, maxlength: 255 })
    originalName: string;

    @Prop({ required: true, unique: true })
    storedFilename: string;

    @Prop({ required: true })
    mimeType: string;

    @Prop({ required: true, min: 1 })
    size: number;
}

export const attachmentSchema = SchemaFactory.createForClass(Attachment);
attachmentSchema.index({ taskId: 1, createdAt: 1 });
attachmentSchema.index({ projectId: 1, createdAt: 1 });

export type AttachmentDocument = HydratedDocument<Attachment>;
