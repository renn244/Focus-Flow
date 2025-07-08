import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";

export class CreateBoardDto {
    @ApiProperty({description: "Name of the board", example: "Development Board" })
    @IsString()
    name: string;

    @ApiProperty({description: "Project Id (ObjectId)", example: "60c72b2f9b1e8b001c8e4d3a" })
    @IsObjectId()
    projectId: string;
}