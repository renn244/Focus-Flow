import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { TEAM_MEMBER_ROLES_ARRAY, TeamMemberRole } from "../constant/role";

export class UpdateRoleDto {
    @ApiProperty({ example: 'admin', description: 'New Role' })
    @IsString()
    @IsEnum(TEAM_MEMBER_ROLES_ARRAY, { message: 'Role must be either admin or member' })
    newRole: TeamMemberRole;
}