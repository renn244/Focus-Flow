import type { z } from "zod";
import type { BoardFormSchema } from "./components/forms/BoardForm";

export type Column = {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
}

export type Task = {
    id: string;
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