import { IsEmail, IsString } from "class-validator";
import { IsMatch } from "src/lib/customValidator/isMatch";

export class ChangePasswordDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    token: string;
    
    @IsString()
    newPassword: string;
    
    @IsString()
    @IsMatch('newPassword', {
        message: 'Passwords do not match',
    })
    confirmPassword: string;
}