import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const TEAM_MEMBER_TABLE_SORT_FIELDS = ['member', 'role', 'email', 'joined'] as const;
export const TEAM_MEMBER_TABLE_SORT_ORDERS = ['asc', 'desc'] as const;

export type TeamMemberTableSortField = typeof TEAM_MEMBER_TABLE_SORT_FIELDS[number];
export type TeamMemberTableSortOrder = typeof TEAM_MEMBER_TABLE_SORT_ORDERS[number];

export class GetTeamMembersTableQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(TEAM_MEMBER_TABLE_SORT_FIELDS)
    sortBy?: TeamMemberTableSortField;

    @IsOptional()
    @IsIn(TEAM_MEMBER_TABLE_SORT_ORDERS)
    sortOrder?: TeamMemberTableSortOrder;
}
