import type { z } from "zod";
import type { ProjectFormSchema } from "./components/form/ProjectForm";

export type Project = {
    _id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'completed';
    color?: string; // just design bruh

    createdAt: string;
    updatedAt: string;
}

export type ProjectSchema = z.infer<typeof ProjectFormSchema>;