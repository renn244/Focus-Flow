import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LocalLoginDto {
    @ApiProperty({ example: "john_doe", description: "Username for the user" })
    @IsString()
    username: string;

    @ApiProperty({ example: "password123", description: "Password for the user" })
    @IsString()
    password: string;
}