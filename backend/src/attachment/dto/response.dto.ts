import { Expose, Transform, Type } from 'class-transformer';

class AttachmentAuthorDto {
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @Expose()
    username: string;

    @Expose()
    displayName?: string;
}

export class AttachmentDto {
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @Expose()
    taskId: string;

    @Expose()
    @Transform(({ value }) => value?.toString())
    projectId: string;

    @Expose()
    originalName: string;

    @Expose()
    mimeType: string;

    @Expose()
    size: number;

    @Expose()
    createdAt: Date;

    @Expose()
    @Type(() => AttachmentAuthorDto)
    @Transform(({ obj }) => obj.authorId)
    author: AttachmentAuthorDto;
}
