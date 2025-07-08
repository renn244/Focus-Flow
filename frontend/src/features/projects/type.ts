import type { z } from "zod";
import type { ProjectFormSchema } from "./components/form/ProjectForm";

export type Project = {
    _id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'completed';
    priority: 'low' | 'medium' | 'high';
    
    progress: number;
    totalTasks: number;
    completedTasks: number;
    openTasks: number;

    dueDate: string; 
    color?: string;
    starred: boolean;

    createdAt: string;
    updatedAt: string;
}

export type ProjectList = Project[];

export type ProjectWithOwner = Project & {
    owner: {
        name: string;
        displayName: string;
        email: string;
        avatarUrl?: string;
    }
}

export type ProjectWithOwnerList = ProjectWithOwner[];

export type ProjectSchema = z.infer<typeof ProjectFormSchema>;