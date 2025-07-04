import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { IsMatch } from "src/lib/customValidator/isMatch";

export class ChangePasswordDto {
    @ApiProperty({ example: "john_doe@gmail.com", description: "Email address of the user" })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "1234567890abcdef", description: "Reset token for changing password" })
    @IsString()
    token: string;
    
    @ApiProperty({ example: "NewPassword123", description: "New password for the user" })
    @IsString()
    newPassword: string;
    
    @ApiProperty({ example: "NewPassword123", description: "Confirmation of the new password" })
    @IsString()
    @IsMatch('newPassword', {
        message: 'Passwords do not match',
    })
    confirmPassword: string;
}