import { IsNotEmpty, IsString } from 'class-validator';
import { IsMatch } from 'src/lib/customValidator/isMatch';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    displayName: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsMatch<CreateUserDto>('password')
    confirmPassword: string;
}
