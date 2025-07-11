import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Board {
    @Prop({ required: true })
    name: string;

    @Prop({ required: false, minlength: 10, maxlength: 200 })
    description?: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
    projectId: Types.ObjectId;

    // add default later for Todo, In Progress, Done
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Column' }], default: [] })
    columns: Types.ObjectId[];
}

export const boardSchema = SchemaFactory.createForClass(Board);
export type BoardDocument = HydratedDocument<Board>;