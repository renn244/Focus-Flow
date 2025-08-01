import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsObjectId } from "src/lib/customValidator/isObjectId";


export class MoveTaskDto {
    @ApiProperty({ description: 'Id of the current column the task belongs to', example: '60c72b2f9b1e8c001c8e4d3a' })
    @IsString()
    @IsObjectId({ message: 'Invalid current column Id.' })
    taskCurrentColumnId: string;

    @ApiProperty({ description: 'Id of the future column the task will be moved to', example: '60c72b2f9b1e8c001c8e4d3b' })
    @IsString()
    @IsObjectId({ message: 'Invalid future column Id.' })
    taskFutureColumnId: string;
}