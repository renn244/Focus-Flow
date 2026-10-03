import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

class AttachmentAuthorDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiPropertyOptional()
    @Expose()
    displayName?: string;
}

export class AttachmentDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    taskId: string;

    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    projectId: string;

    @ApiProperty({ example: 'project-notes.pdf' })
    @Expose()
    originalName: string;

    @ApiProperty({ example: 'application/pdf' })
    @Expose()
    mimeType: string;

    @ApiProperty({ example: 24576 })
    @Expose()
    size: number;

    @ApiProperty({ format: 'date-time' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ type: AttachmentAuthorDto })
    @Expose()
    @Type(() => AttachmentAuthorDto)
    @Transform(({ obj }) => obj.authorId)
    author: AttachmentAuthorDto;
}
