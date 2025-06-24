import { IsMatch } from "src/lib/customValidator/isMatch"; 
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LocalSignUpDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsMatch('password', { message: 'Passwords do not match' })
    confirmPassword: string;
}