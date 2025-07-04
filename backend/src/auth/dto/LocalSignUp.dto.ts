import { IsMatch } from "src/lib/customValidator/isMatch"; 
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LocalSignUpDto {
    @ApiProperty({ example: "john_doe", description: "Username for the user" })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: "john_doe@gmai.com", description: "Email address of the user" })
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ example: "password123", description: "Password for the user" })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ example: "password123", description: "Confirmation of the password" })
    @IsNotEmpty()
    @IsString()
    @IsMatch('password', { message: 'Passwords do not match' })
    confirmPassword: string;
}