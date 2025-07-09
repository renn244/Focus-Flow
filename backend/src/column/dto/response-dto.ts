import { Expose, Transform } from "class-transformer";
import { Types } from "mongoose";

export class ColumnDto {
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    color: string;

    @Expose()
    order: number;

    @Expose()
    @Transform(({ obj }) => obj.tasks || [])
    tasks: Types.ObjectId[]; // Assuming tasks is an array of objects

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}