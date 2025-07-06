import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export class GetProjectQueryDto {
    @ApiPropertyOptional({ description: 'filter by project status', example: 'active', enum: ["all", "active", "archived", "completed"] })
    @IsEnum(["all", "active", "archived", "completed"],
        { message: 'Status must be one of: all, active, archived, completed' }
    )
    @IsOptional()
    status?: "all" | "active" | "archived" | "completed";

    @ApiPropertyOptional({ description: 'filter by project priority', example: 'low', enum: ["all", "low", "medium", "high"] })
    @IsEnum(["all", "low", "medium", "high"],
        { message: 'Priority must be one of: all, low, medium, high' }
    )
    @IsOptional()
    priority?: "all" | "low" | "medium" | "high";
}