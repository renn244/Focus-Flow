import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, MaxLength, MinLength } from 'class-validator';
import { IsObjectId } from 'src/lib/customValidator/isObjectId';

export class CreateCommentDto {
    @ApiProperty({ description: 'The task receiving the comment' })
    @IsString()
    @IsObjectId({ message: 'Invalid task id.' })
    taskId: string;

    @ApiProperty({ description: 'Tiptap JSON document' })
    @IsObject()
    content: Record<string, unknown>;

    @ApiProperty({ description: 'Plain text extracted from the editor', maxLength: 5000 })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(5000)
    contentText: string;
}
