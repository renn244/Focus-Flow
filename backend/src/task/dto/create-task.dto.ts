import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class CreateTaskDto {
    @ApiProperty({ description: 'Title of the task', example: 'Complete project documentation' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Description of the task', example: 'Write detailed documentation for the project.' })
    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long.' })
    @MaxLength(300, { message: 'Description cannot exceed 300 characters.' })
    description?: string;

    @ApiProperty({ description: 'Priority of the task', example: 'medium', enum: ['low', 'medium', 'high'] })
    @IsString()
    @IsEnum(["low", "medium", "high"], { message: 'Priority must be one of: low, medium, high.' })
    priority: "low" | "medium" | "high";

    @ApiProperty({ description: 'Id of the board to which the task belongs', example: '60c72b2f9b1e8d3f4c8b4567' })
    @IsString()
    @IsObjectId({ message: 'Invalid board Id.' })
    boardId: string;

    @ApiProperty({ description: 'Id of the column to which the task belongs', example: '60c72b2f9b1e8d3f4c8b4568' })
    @IsString()
    @IsObjectId({ message: 'Invalid column Id.' })
    columnId: string;

    @ApiProperty({ description: 'Id of the project member assigned to this task', example: '60c72b2f9b1e8d3f4c8b4569', required: false })
    @IsOptional()
    @IsString()
    @IsObjectId({ message: 'Invalid assignee Id.' })
    assignee?: string;

    @ApiProperty({ description: 'Date where the task is due', example: '2025-08-15' })
    @IsDateString()
    dueDate?: string;

    @ApiProperty({ description: 'tags related to the task to better distinguish it.', example: ['documentation', 'writing'] })
    @IsArray()
    @IsString({ each: true, message: 'Tags must be an array of strings.' })
    tags?: string[];
}
