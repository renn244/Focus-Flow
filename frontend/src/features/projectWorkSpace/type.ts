import type { z } from "zod";
import type { BoardFormSchema } from "./components/forms/BoardForm";
import type { columnFormSchema } from "./components/forms/ColumnForm";
import type { TaskFormSchema } from "./components/forms/TaskForm";

export type Board = {
    _id: string;
    name: string;
    description?: string;
    projectId: string;
    columns: string[]; // Array of column object Ids
    createdAt: string;
    updatedAt: string;
}

export type BoardWithColumns = {
    columns: Column[];
} & Omit<Board, 'columns'>;

export type Column = {
    _id: string;
    title: string;
    color: string;
    order: number;
    tasks: string[];
    createdAt: string;
    updatedAt: string;
}

export type ColumnWithBoardId = {
    boardId: string;
} & Column

export type ColumnWithTasks = {
    tasks: TaskWithBoardAndColumn[];
} & Omit<Column, 'tasks'>

export type Task = {
    _id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    boardId: string;
    columnId: string;
    assignee?: string;

    dueDate?: string;
    tags?: string[];
    order?: number

    createdAt: string;
    updatedAt: string;
//  comments: number;
//  attachments: number;
//  status: string;
}

export type TaskWithBoardAndColumn = {
    board: Pick<Board, '_id' | 'name' | 'projectId'>;
    column: Omit<Column, 'order' | 'tasks' | 'createdAt' | 'updatedAt'>;
    assigneeUser?: {
        _id: string;
        displayName: string;
        username: string;
        avatarUrl?: string;
    };
} & Omit<Task, 'boardId' | 'columnId'>;

export type BoardSchema = z.infer<typeof BoardFormSchema>;
export type ColumnSchema = z.infer<typeof columnFormSchema>;
export type TaskSchema = z.infer<typeof TaskFormSchema>;
