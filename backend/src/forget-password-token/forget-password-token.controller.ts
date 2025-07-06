import { Body, Controller, Post } from '@nestjs/common';
import { ForgetPasswordTokenService } from './forget-password-token.service';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { ResendResetLinkDto } from './dto/resend-reset-link.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger';

@Controller('forget-password-token')
export class ForgetPasswordTokenController {
    constructor(
        private readonly forgetPasswordTokenService: ForgetPasswordTokenService
    ) {}

    @ApiBadRequestResponse({ 
        description: 'validation errors',
        example: {
            statusCode: 400, message: 'Validation failed',
            erros: { email: { message: 'No user found with this email' } }            
        }
    })
    @ApiResponse({ 
        status: 201, description: 'Reset password link sent to your email', 
        example: { message: 'reset password sent to your email'} 
    })
    @Post('send-reset-link')
    async sendResetLink(@Body() body: SendResetLinkDto) {
        return this.forgetPasswordTokenService.sendResetLink(body);
    }

    @ApiNotFoundResponse({ description: 'No reset password token found for this email'})
    @ApiResponse({ 
        status: 200, description: 'Reset password link resent to your email', 
        example: { message: 'reset password link resent to you email' }
    })
    @Post('resend-reset-link')
    async resendResetLink(@Body() body: ResendResetLinkDto) {
        return this.forgetPasswordTokenService.resendResetLink(body);
    }

    @ApiNotFoundResponse({ description: 'Invalid or Expired reset password token. Please request a new link.'})
    @ApiBadGatewayResponse({ description: 'Invalid or Expired reset password token. Please request a new link.' })
    @ApiResponse({ 
        status: 200, description: 'Password changed successfully',
        example: { message: 'Password changed successfully' }
    })
    @Post('change-password')
    async changePassword(@Body() body: ChangePasswordDto) {
        return this.forgetPasswordTokenService.changePassword(body);
    }
}
