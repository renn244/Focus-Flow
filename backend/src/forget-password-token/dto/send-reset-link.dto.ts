import { IsEmail, IsString } from "class-validator";

export class SendResetLinkDto {
    @IsString()
    @IsEmail()
    email: string;
}