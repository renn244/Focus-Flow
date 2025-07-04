import { PartialType } from "@nestjs/swagger";
import { CreateProjectDto } from "./create-project.dto";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    // @IsEnum(["active", "archived", "completed"], { message: 'Status must be one of the following: active, archived, completed.' })
    //     status: "active" | "archived" | "completed";
}