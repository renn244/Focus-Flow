import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class UpdateColumnDto {
    @ApiProperty({ description: 'Title of the column', example: 'To Do' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ description: 'Color of the column', example: '#FF5733' })
    @IsString()
    @IsOptional()
    color: string;

    @ApiProperty({ description: 'Board Id (ObjectId)', example: '60c72b2f9b1e8b001c8e4d3a' })
    @IsObjectId()
    boardId: string;
}