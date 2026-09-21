import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
    @ApiPropertyOptional({ description: 'Updated Tiptap JSON document' })
    @IsOptional()
    @IsObject()
    content?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Updated plain text extracted from the editor', maxLength: 5000 })
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(5000)
    contentText?: string;
}
