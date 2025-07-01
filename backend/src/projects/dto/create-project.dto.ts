import { IsString, MinLength, IsEnum, MaxLength, IsOptional } from "class-validator";

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long.' })
    @MaxLength(100, { message: 'Description must be at most 100 characters long.' })
    description?: string;

    @IsEnum(["active", "archived", "completed"], { message: 'Status must be one of the following: active, archived, completed.' })
    status: "active" | "archived" | "completed";

    @IsString()
    @IsOptional()
    color?: string;
}