import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform } from 'class-transformer';

class CommentAuthorDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    displayName: string;

    @ApiPropertyOptional()
    @Expose()
    avatarUrl?: string;
}

export class CommentDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    taskId: string;

    @ApiProperty({ description: 'Tiptap JSON document', type: 'object', additionalProperties: true })
    @Expose()
    content: Record<string, unknown>;

    @ApiProperty()
    @Expose()
    contentText: string;

    @ApiProperty({ type: CommentAuthorDto })
    @Expose()
    @Transform(({ obj }) => plainToInstance(CommentAuthorDto, obj.authorId, { excludeExtraneousValues: true }))
    author: CommentAuthorDto;

    @ApiProperty({ format: 'date-time' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ format: 'date-time' })
    @Expose()
    updatedAt: Date;
}
