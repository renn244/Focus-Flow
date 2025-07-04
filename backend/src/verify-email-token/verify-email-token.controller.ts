import { Body, Controller, Post } from '@nestjs/common';
import { VerifyEmailTokenService } from './verify-email-token.service';
import { VerifyEmailTokenDto } from './dto/verify-email-token.dto';
import { ResendEmailTokenDto } from './dto/resend-email-token.dto';
import { NewVerificationTokenDto } from './dto/new-verification-token.dto';

@Controller('verify-email-token')
export class VerifyEmailTokenController {
    constructor(
        private readonly verifyEmailTokenService: VerifyEmailTokenService,
    ) {}

    @Post('verify')
    async verifyEmailToken(@Body() body: VerifyEmailTokenDto) {
        return this.verifyEmailTokenService.verify(body);
    }

    @Post('resend')
    async resendEmailToken(@Body() body: ResendEmailTokenDto) {       
        return this.verifyEmailTokenService.resend(body);
    }

    @Post('newVerification')
    async newVerificationToken(@Body() body: NewVerificationTokenDto) {
        return this.verifyEmailTokenService.newVerification(body);
    }
}