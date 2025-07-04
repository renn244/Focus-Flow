import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyEmailTokenDto {
    @ApiProperty({ example: "1234567890abcdef", description: "Verification token for email" })
    @IsString()
    token: string;
}