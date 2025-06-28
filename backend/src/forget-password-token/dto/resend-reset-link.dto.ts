import { IsEmail, IsString } from "class-validator";

export class ResendResetLinkDto {
    @IsString()
    @IsEmail()
    email: string;
}