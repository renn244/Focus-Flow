import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Project {
    @Prop({ required: true })
    name: string;

    @Prop({ minlength: 10, maxlength: 100 })
    description?: string;

    @Prop({ default: "active" })
    status: "active" | "archived" | "completed";

    @Prop()
    color?: string; // just design bruh

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId;
}

export const projectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = HydratedDocument<Project>;