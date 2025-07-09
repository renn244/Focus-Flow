import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateColumnDto {
    @ApiProperty({ description: 'Title of the column', example: 'To Do' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ description: 'Color of the column', example: '#FF5733' })
    @IsString()
    @IsOptional()
    color: string;
}