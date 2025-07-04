import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SendResetLinkDto {
    @ApiProperty({ example: "john_doe@gmail.com", description: "Email address to send the reset link" })
    @IsString()
    @IsEmail()
    email: string;
}