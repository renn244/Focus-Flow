import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class CreateBoardDto {
    @ApiProperty({description: "Name of the board", example: "Development Board" })
    @IsString()
    name: string;

    @ApiProperty({description: "Description of the board", example: "This board is for development tasks" })
    @IsString()
    @IsOptional()
    @MinLength(10, {message: "Description must be at least 10 characters long"})
    @MaxLength(200, {message: "Description must not exceed 200 characters"})
    description?: string;

    @ApiProperty({description: "Project Id (ObjectId)", example: "60c72b2f9b1e8b001c8e4d3a" })
    @IsObjectId()
    projectId: string;
}