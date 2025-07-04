import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class ResendEmailTokenDto {
    @ApiProperty({ example: "john_doe@gmail.com", description: "Email address of the user" })
    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}