import { Body, Controller, Post } from '@nestjs/common';
import { ForgetPasswordTokenService } from './forget-password-token.service';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { ResendResetLinkDto } from './dto/resend-reset-link.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('forget-password-token')
export class ForgetPasswordTokenController {
    constructor(
        private readonly forgetPasswordTokenService: ForgetPasswordTokenService
    ) {}

    @Post('send-reset-link')
    async sendResetLink(@Body() body: SendResetLinkDto) {
        return this.forgetPasswordTokenService.sendResetLink(body);
    }

    @Post('resend-reset-link')
    async resendResetLink(@Body() body: ResendResetLinkDto) {
        return this.forgetPasswordTokenService.resendResetLink(body);
    }

    @Post('change-password')
    async changePassword(@Body() body: ChangePasswordDto) {
        return this.forgetPasswordTokenService.changePassword(body);
    }
}
