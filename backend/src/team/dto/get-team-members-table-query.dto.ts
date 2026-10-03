import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const TEAM_MEMBER_TABLE_SORT_FIELDS = ['member', 'role', 'email', 'joined'] as const;
export const TEAM_MEMBER_TABLE_SORT_ORDERS = ['asc', 'desc'] as const;

export type TeamMemberTableSortField = typeof TEAM_MEMBER_TABLE_SORT_FIELDS[number];
export type TeamMemberTableSortOrder = typeof TEAM_MEMBER_TABLE_SORT_ORDERS[number];

export class GetTeamMembersTableQueryDto {
    @ApiPropertyOptional({ description: 'One-based page number', default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: 'Maximum members per page', default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({ description: 'Case-insensitive substring match against member name, username, or email' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: TEAM_MEMBER_TABLE_SORT_FIELDS, default: 'member' })
    @IsOptional()
    @IsIn(TEAM_MEMBER_TABLE_SORT_FIELDS)
    sortBy?: TeamMemberTableSortField;

    @ApiPropertyOptional({ enum: TEAM_MEMBER_TABLE_SORT_ORDERS, default: 'asc' })
    @IsOptional()
    @IsIn(TEAM_MEMBER_TABLE_SORT_ORDERS)
    sortOrder?: TeamMemberTableSortOrder;
}
