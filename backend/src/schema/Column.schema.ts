import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Column {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    color: string;

    @Prop({ default: 0 })
    order: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
    tasks: Types.ObjectId[];
}

export const columnSchema = SchemaFactory.createForClass(Column);
export type ColumnDocument = HydratedDocument<Column>;
