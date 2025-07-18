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

// follow the backend (not priority rn)
export type Task = {
    _id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    assignee: {
        name: string;
        avatar?: string;
        initials: string;
    },
    dueDate: string;
    tags: string[];
    comments: number;
    attachments: number;
    status: string;
}

export type BoardSchema = z.infer<typeof BoardFormSchema>;
export type ColumnSchema = z.infer<typeof columnFormSchema>;
export type TaskSchema = z.infer<typeof TaskFormSchema>;