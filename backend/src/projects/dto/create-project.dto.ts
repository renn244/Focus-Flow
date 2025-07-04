import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsEnum, MaxLength, IsOptional, IsDateString } from "class-validator";

export class CreateProjectDto {
    @ApiProperty({ example: 'Project Name', description: 'Name of the project' })
    @IsString()
    name: string;

    @ApiProperty({ example: "This is a sample project description.", description: 'Description of the project' })
    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long.' })
    @MaxLength(300, { message: 'Description must be at most 300 characters long.' })
    description?: string;

    @ApiProperty({ example: 'medium', description: 'Priority status of the project', enum: ['low', 'medium', 'high'] })
    @IsString()
    @IsEnum(["low", "medium", "high"], { message: 'Priority must be one of the following: low, medium, high.' })
    priority: 'low' | 'medium' | 'high';

    @ApiProperty({ example: '#ffffff', description: 'Color for the project just for visual design'})
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty({ example: '2025-08-15', description: 'Due date for the project in YYYY-MM-DD format' })
    @IsDateString()
    dueDate: string;
}