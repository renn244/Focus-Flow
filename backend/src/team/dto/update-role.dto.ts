import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class UpdateRoleDto {
    @ApiProperty({ example: 'admin', description: 'New Role' })
    @IsString()
    @IsEnum(['admin', 'member'], { message: 'Role must be either admin or member' })
    newRole: 'admin' | 'member';
}