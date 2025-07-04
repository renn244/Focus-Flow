import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class ResendResetLinkDto {
    @ApiProperty({ example: "john_doe@gmail.com", description: "Email address to resend the reset link" })
    @IsString()
    @IsEmail()
    email: string;
}