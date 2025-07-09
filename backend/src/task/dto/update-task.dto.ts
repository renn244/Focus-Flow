import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./create-task.dto";
import { IsObjectId } from "src/lib/customValidator/isObjectId";
import { IsNumber } from "class-validator";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiProperty({ description: 'Id of the user who the task is assign to.', example: '60c72b2f9b1e8d3f4c8b4567' })
    @IsObjectId()
    assignee: string;

    @ApiProperty({ description: 'Order of the task in the column', example: 1 })
    @IsNumber()
    order: number;
}