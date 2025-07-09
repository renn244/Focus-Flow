import { Expose } from "class-transformer";

export class TaskDto {
    @Expose()
    id: string;

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