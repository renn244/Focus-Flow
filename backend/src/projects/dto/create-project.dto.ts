import { IsString, MinLength, IsEnum, MaxLength, IsOptional, IsDateString } from "class-validator";

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long.' })
    @MaxLength(300, { message: 'Description must be at most 300 characters long.' })
    description?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsDateString()
    dueDate: string;
}