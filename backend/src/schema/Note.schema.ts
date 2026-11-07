import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
    projectId: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title: string;

    // Tiptap JSON document.
    @Prop({ type: Object, default: () => ({ type: 'doc', content: [] }) })
    content: Record<string, unknown>;

    // Plain text from the editor, used for search and list previews.
    @Prop({ default: '', maxlength: 100000 })
    contentText: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    updatedBy: Types.ObjectId;

    @Prop({ default: false })
    pinned: boolean;

    // Tasks mentioned in the note, kept in sync with the content on every save.
    @Prop({ type: [String], default: [], index: true })
    taskIds: string[];
}

export const noteSchema = SchemaFactory.createForClass(Note);
noteSchema.index({ projectId: 1, pinned: -1, updatedAt: -1 });

export type NoteDocument = HydratedDocument<Note>;
