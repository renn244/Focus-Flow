import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProjectActivityQueryDto {
    @ApiPropertyOptional({ description: 'Maximum number of activity records to return', default: 20, minimum: 1, maximum: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;

    @ApiPropertyOptional({ description: 'Cursor returned as nextCursor from the previous response' })
    @IsOptional()
    @IsMongoId()
    cursor?: string;
}
