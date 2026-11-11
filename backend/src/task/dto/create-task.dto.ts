import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { MAX_CHECKLIST_ITEMS } from "./checklist.dto";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class CreateTaskDto {
    @ApiProperty({ description: 'Title of the task', example: 'Complete project documentation' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Description of the task', example: 'Write detailed documentation for the project.' })
    @IsOptional()
    @IsString()
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

    @ApiPropertyOptional({ description: 'Date the task is due. Send null to clear it.', example: '2025-08-15', nullable: true })
    @IsOptional()
    @IsDateString()
    dueDate?: string | null;

    @ApiPropertyOptional({ description: 'tags related to the task to better distinguish it.', example: ['documentation', 'writing'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true, message: 'Tags must be an array of strings.' })
    tags?: string[];

    @ApiPropertyOptional({ description: 'Checklist items to start the task with, in order.', example: ['Write the outline', 'Get feedback'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_CHECKLIST_ITEMS)
    @IsString({ each: true })
    @MinLength(1, { each: true, message: 'Checklist items need some text.' })
    @MaxLength(200, { each: true, message: 'Checklist items can be up to 200 characters.' })
    @Transform(({ value }) => (Array.isArray(value)
        ? value.map((text) => (typeof text === 'string' ? text.trim() : text))
        : value))
    checklist?: string[];
}
