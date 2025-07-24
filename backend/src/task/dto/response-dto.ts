import { Expose, plainToInstance, Transform } from "class-transformer";

export class TaskDto {
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    description?: string;

    @Expose()
    priority: "low" | "medium" | "high";

    @Expose()
    boardId: string;

    @Expose()
    columnId: string;

    @Expose()
    dueDate?: string;

    @Expose()
    tags?: string[];

    @Expose()
    assigneeId?: string;

    @Expose()
    order?: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}

class ColumnDto {
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    color: string;
}

class BoardDto {
    @Expose()
    _id: string;

    @Expose()
    name: string;
}

export class TaskWithBoardAndColumnDto extends TaskDto {
    @Expose()
    @Transform(({ obj }) => plainToInstance(ColumnDto, obj.columnId, { excludeExtraneousValues: true }))
    column: ColumnDto;

    @Expose()
    @Transform(({ obj }) => plainToInstance(BoardDto, obj.boardId, { excludeExtraneousValues: true }))
    board: BoardDto;
}