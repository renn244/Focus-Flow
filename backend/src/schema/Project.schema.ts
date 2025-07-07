import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Project {
    @Prop({ required: true })
    name: string;

    @Prop({ minlength: 10, maxlength: 300 })
    description?: string;

    @Prop({ default: "active" })
    status: "active" | "archived" | "completed";

    @Prop({ default: "medium" })
    priority: "low" | "medium" | "high";

    @Prop({ min: 0, max: 100, default: 0 })
    progress: number;

    @Prop({ default: 0 })
    totalTasks: number;

    @Prop({ default: 0 })
    completedTasks: number;

    @Prop({ default: 0 })
    openTasks: number;
    
    @Prop()
    dueDate: Date;

    @Prop()
    color?: string; // just design bruh

    @Prop({ default: false })
    starred: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId;

    @Prop({ default: Date.now })
    lastSeen: Date;
}

export const projectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = HydratedDocument<Project>;