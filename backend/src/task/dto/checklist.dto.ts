import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const MAX_CHECKLIST_ITEMS = 100;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class AddChecklistItemsDto {
    @ApiProperty({
        description: 'One or more items to add, in order. Pasting several lines sends one item per line.',
        example: ['Write reconnect test', 'Repro on slow network'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MinLength(1, { each: true })
    @MaxLength(200, { each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value.map((text) => (typeof text === 'string' ? text.trim() : text)) : value))
    texts: string[];
}

export class UpdateChecklistItemDto {
    @ApiPropertyOptional({ example: 'Add exponential backoff' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    @Transform(trim)
    text?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    done?: boolean;
}

export class ReorderChecklistDto {
    @ApiProperty({
        description: 'Every item id of the checklist, in the new order.',
        example: ['6650c0f1a1b2c3d4e5f60718', '6650c0f1a1b2c3d4e5f60717'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(MAX_CHECKLIST_ITEMS)
    @ArrayUnique()
    @IsMongoId({ each: true })
    itemIds: string[];
}
