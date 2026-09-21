import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: String, ref: 'Task', required: true, index: true })
    taskId: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    authorId: Types.ObjectId;

    @Prop({ type: Object, required: true })
    content: Record<string, unknown>;

    @Prop({ required: true, minlength: 1, maxlength: 5000 })
    contentText: string;
}

export const commentSchema = SchemaFactory.createForClass(Comment);
commentSchema.index({ taskId: 1, createdAt: 1 });

export type CommentDocument = HydratedDocument<Comment>;
