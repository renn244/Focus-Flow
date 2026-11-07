import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** One step in a task's checklist. Lives inside the task document. */
@Schema({ _id: true, timestamps: false })
export class ChecklistItem {
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 200 })
    text: string;

    @Prop({ default: false })
    done: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    doneBy?: Types.ObjectId;

    @Prop({ type: Date })
    doneAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;
}

export const checklistItemSchema = SchemaFactory.createForClass(ChecklistItem);

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop({ minlength: 10, maxlength: 300 })
    description?: string;

    @Prop({ enum: ["low", "medium", "high"], default: "low" })
    priority: "low" | "medium" | "high";

    @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
    boardId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
    columnId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    assignee?: Types.ObjectId;
    
    @Prop({ type: Date })
    dueDate: Date;

    @Prop({ default: [] })
    tags: string[];

    @Prop({ default: 0 })
    order: number; // Order of the task in the column

    @Prop({ type: [checklistItemSchema], default: [] })
    checklist: ChecklistItem[];
}

export const taskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = HydratedDocument<Task>;