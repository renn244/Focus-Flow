import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** A saved copy of a note as one person left it. Newest 50 per note are kept. */
@Schema({ timestamps: true })
export class NoteVersion {
    @Prop({ type: Types.ObjectId, ref: 'Note', required: true })
    noteId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    // Tiptap JSON document.
    @Prop({ type: Object, required: true })
    content: Record<string, unknown>;

    @Prop({ default: '' })
    contentText: string;

    /** Who made the edits that led to this version. */
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    savedBy: Types.ObjectId;

    /** When the note looked like this (its last edit before the copy was taken). */
    @Prop({ type: Date, required: true })
    savedAt: Date;

    /** Blocks (paragraphs, list items, images…) added and removed since the version before. */
    @Prop({ default: 0 })
    added: number;

    @Prop({ default: 0 })
    removed: number;
}

export const noteVersionSchema = SchemaFactory.createForClass(NoteVersion);
noteVersionSchema.index({ noteId: 1, savedAt: -1 });

export type NoteVersionDocument = HydratedDocument<NoteVersion>;
