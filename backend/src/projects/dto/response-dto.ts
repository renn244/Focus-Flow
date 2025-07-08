import { Exclude, Expose, plainToInstance, Transform, Type } from "class-transformer";

export class ProjectDto {
    @Expose()
    _id: string;   

    @Expose()
    name: string;

    @Expose()
    description?: string;

    @Expose()
    status: "active" | "archived" | "completed";

    @Expose()
    priority: "low" | "medium" | "high";

    @Expose()
    progress: number;

    @Expose()
    totalTasks: number;

    @Expose()
    completedTasks: number;

    @Expose()
    openTasks: number;

    @Expose()
    dueDate?: Date;

    @Expose()
    color?: string;

    @Expose()
    starred: boolean;

    @Expose()
    ownerId: string;

    @Expose()
    lastSeen: Date;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}

export class OwnerDto {
    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    displayName: string;

    @Expose()
    @Transform(({ obj }) => obj.avatarUrl || "")
    avatarUrl?: string;
}

export class ProjectWithOwnerDto extends ProjectDto {
    @Expose()
    @Transform(({ obj }) => 
        obj.ownerId ? plainToInstance(OwnerDto, obj.ownerId, { excludeExtraneousValues: true }) : null
    )
    owner: OwnerDto

    @Exclude() // so that this field will not be exposed because we already have owner
    ownerId: string;
}