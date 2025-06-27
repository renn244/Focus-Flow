import { Body, Controller, Post } from '@nestjs/common';
import { VerifyEmailTokenService } from './verify-email-token.service';

@Controller('verify-email-token')
export class VerifyEmailTokenController {
    constructor(
        private readonly verifyEmailTokenService: VerifyEmailTokenService,
    ) {}

    @Post('verify')
    async verifyEmailToken(@Body() body: { token: string }) {
        return this.verifyEmailTokenService.verify(body.token);
    }

    @Post('resend')
    async resendEmailToken(@Body() body: { email: string }) {       
        return this.verifyEmailTokenService.resend(body.email);
    }

    @Post('newVerification')
    async newVerificationToken(@Body() body: { email: string }) {
        return this.verifyEmailTokenService.newVerification(body.email);
    }
}
