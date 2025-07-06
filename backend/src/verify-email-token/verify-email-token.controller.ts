import { Body, Controller, Post } from '@nestjs/common';
import { VerifyEmailTokenService } from './verify-email-token.service';
import { VerifyEmailTokenDto } from './dto/verify-email-token.dto';
import { ResendEmailTokenDto } from './dto/resend-email-token.dto';
import { NewVerificationTokenDto } from './dto/new-verification-token.dto';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';

@Controller('verify-email-token')
export class VerifyEmailTokenController {
    constructor(
        private readonly verifyEmailTokenService: VerifyEmailTokenService,
    ) {}

    @ApiNotFoundResponse({ description: 'Invalid or Does not exist verification token' })
    @ApiBadRequestResponse({ description: 'Verification token has expired' })
    @ApiBadRequestResponse({ description: 'Invalid verification token' })
    @ApiResponse({
        status: 200, description: 'Email verified successfully',
        example: { 
            message: 'Email verified successfully', 
            action: 'redirect', redirectUrl: '/login'
        } 
    })
    @Post('verify')
    async verifyEmailToken(@Body() body: VerifyEmailTokenDto) {
        return this.verifyEmailTokenService.verify(body);
    }

    @ApiNotFoundResponse({ description: 'No verification token found for this email' })
    @ApiResponse({
        status: 200, description: 'Verification token resent successfully',
        example: { message: 'Verification token resent successfully' }
    })
    @Post('resend')
    async resendEmailToken(@Body() body: ResendEmailTokenDto) {       
        return this.verifyEmailTokenService.resend(body);
    }

    @ApiBadRequestResponse({ description: 'A verification token already exists for this email' })
    @ApiNotFoundResponse({ description: 'User not found with this email' })
    @ApiResponse({
        status: 201, description: 'New verification token created successfully',
        example: { message: 'New verification token created successfully' }
    })
    @Post('newVerification')
    async newVerificationToken(@Body() body: NewVerificationTokenDto) {
        return this.verifyEmailTokenService.newVerification(body);
    }
}