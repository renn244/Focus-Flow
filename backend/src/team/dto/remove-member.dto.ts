import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class RemoveMemberDto {
    @ApiProperty({ example: '60c72b2f9b1e8b001c8e4d3a', description: 'Project ID' })
    @IsString()
    @IsObjectId()
    projectId: string;

    @ApiProperty({ example: '60c72b2f9b1e8b001c8e4d3b', description: 'User ID to be removed' })
    @IsString()
    @IsObjectId()
    userId: string;
}