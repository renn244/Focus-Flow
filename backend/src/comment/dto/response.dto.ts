import { Expose, plainToInstance, Transform } from 'class-transformer';

class CommentAuthorDto {
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @Expose()
    username: string;

    @Expose()
    displayName: string;

    @Expose()
    avatarUrl?: string;
}

export class CommentDto {
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @Expose()
    @Transform(({ value }) => value?.toString())
    taskId: string;

    @Expose()
    content: Record<string, unknown>;

    @Expose()
    contentText: string;

    @Expose()
    @Transform(({ obj }) => plainToInstance(CommentAuthorDto, obj.authorId, { excludeExtraneousValues: true }))
    author: CommentAuthorDto;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
