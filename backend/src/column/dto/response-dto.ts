import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";
import { Types } from "mongoose";
import { TaskWithBoardAndColumnDto } from "src/task/dto/response-dto";

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

export class ColumnWithBoardIdDto extends ColumnDto {
    @Expose()
    boardId: string;
}

export class ColumnWithTasksDto {
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    color: string;

    @Expose()
    order: number;
    
    @Expose()
    @Transform(({ obj }) => obj.tasks ? plainToInstance(TaskWithBoardAndColumnDto, obj.tasks, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
    }) : [])
    tasks: TaskWithBoardAndColumnDto[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}