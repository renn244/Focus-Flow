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
    @Transform(({ value }) => value?._id?.toString?.() ?? value?.toString?.())
    assignee?: string;

    @Expose()
    order?: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}

class ColumnDto {
    @Transform((value) => value.obj._id.toString())
    @Expose()
    _id: string;

    @Expose()
    title: string;

    @Expose()
    color: string;
}

class BoardDto {
    @Transform((value) => value.obj._id.toString())
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    @Transform(({ value }) => value?.toString())
    projectId: string;
}

class AssigneeDto {
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    _id: string;

    @Expose()
    displayName: string;

    @Expose()
    username: string;

    @Expose()
    avatarUrl?: string;
}

export class TaskWithBoardAndColumnDto extends TaskDto {
    @Expose()
    @Transform(({ obj }) => plainToInstance(ColumnDto, obj.columnId, { excludeExtraneousValues: true }))
    column: ColumnDto;

    @Expose()
    @Transform(({ obj }) => plainToInstance(BoardDto, obj.boardId, { excludeExtraneousValues: true }))
    board: BoardDto;

    @Expose()
    @Transform(({ obj }) => {
        if (!obj.assignee || typeof obj.assignee !== 'object') {
            return undefined;
        }

        return plainToInstance(AssigneeDto, obj.assignee, { excludeExtraneousValues: true });
    })
    assigneeUser?: AssigneeDto;
}
