import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsObjectId } from 'src/lib/customValidator/isObjectId';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateNoteDto {
    @ApiProperty({ description: 'The project the note belongs to' })
    @IsString()
    @IsObjectId({ message: 'Invalid project id.' })
    projectId: string;

    @ApiProperty({ maxLength: 160 })
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(160)
    title: string;

    @ApiPropertyOptional({ description: 'Tiptap JSON document' })
    @IsOptional()
    @IsObject()
    content?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Plain text extracted from the editor', maxLength: 100000 })
    @IsOptional()
    @IsString()
    @MaxLength(100000)
    contentText?: string;
}

export class UpdateNoteDto {
    @ApiPropertyOptional({ maxLength: 160 })
    @IsOptional()
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(160)
    title?: string;

    @ApiPropertyOptional({ description: 'Tiptap JSON document' })
    @IsOptional()
    @IsObject()
    content?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Plain text extracted from the editor', maxLength: 100000 })
    @IsOptional()
    @IsString()
    @MaxLength(100000)
    contentText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    pinned?: boolean;
}

export class NoteUserDto {
    @ApiProperty() _id: string;
    @ApiProperty() username: string;
    @ApiPropertyOptional() displayName?: string;
    @ApiPropertyOptional() avatarUrl?: string;
}

export class NoteSummaryDto {
    @ApiProperty() _id: string;
    @ApiProperty() projectId: string;
    @ApiProperty() title: string;
    @ApiProperty({ description: 'First 160 characters of the note text' }) excerpt: string;
    @ApiProperty() pinned: boolean;
    @ApiProperty({ type: [String] }) taskIds: string[];
    @ApiProperty({ type: NoteUserDto }) createdBy: NoteUserDto;
    @ApiProperty({ type: NoteUserDto }) updatedBy: NoteUserDto;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}

export class NoteDto extends NoteSummaryDto {
    @ApiProperty({ description: 'Tiptap JSON document', type: 'object', additionalProperties: true })
    content: Record<string, unknown>;

    @ApiProperty({ description: 'Whether the current user may delete the note (author or project admin)' })
    canDelete: boolean;
}

export class TaskNoteRefDto {
    @ApiProperty() _id: string;
    @ApiProperty() title: string;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}
