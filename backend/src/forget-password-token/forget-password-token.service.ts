import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import generateToken from 'src/lib/utils/generateToken';
import { PasswordToken, PasswordTokenDocument } from 'src/schema/PasswordToken';
import { CreateForgetPasswordTokenDto } from './dto/create-forget-password-token.dto';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { ResendResetLinkDto } from './dto/resend-reset-link.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ForgetPasswordTokenService {
    constructor(
        @InjectModel(PasswordToken.name) private passwordTokenModel: Model<PasswordTokenDocument>,
        private readonly userService: UserService,
        private readonly emailService: EmailService,
    ) {}

    async sendResetLink({ email }: SendResetLinkDto) {
        const token = await this.createToken({ email });
        const confirmationUrl = `${process.env.CLIENT_BASE_URL}/reset-password?token=${token.token}&email=${email}`;

        await this.emailService.sendEmail({
            to: email, subject: 'Reset password',
            template: 'reset-password', 
            context: { 
                confirmationUrl, 
                email, // maybe switch with username or display name later on
            }
        })

        return {
            message: 'reset password sent to your email',
        }
    }

    async resendResetLink({ email }: ResendResetLinkDto) {
        const token = await this.getTokenByEmail(email);

        if(!token) {
            throw new NotFoundException('No reset password token found for this email');
        }

        const confirmationUrl = `${process.env.CLIENT_BASE_URL}/reset-password?token=${token.token}&email=${email}`;
        await this.emailService.sendEmail({
            to: email, subject: 'Reset password',
            template: 'reset-password',
            context: { 
                confirmationUrl, 
                email: email, // maybe switch with username or display name later on
            }
        })
    
        return {
            message: 'reset password link resent to your email',
        }
    }

    async changePassword({ email, token, newPassword } : ChangePasswordDto) {
        const isTokenValid = await this.validateToken(email, token);

        if(!isTokenValid) {
            throw new BadRequestException('Invalid or expired reset password token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userService.updatePasswordByEmail(email, hashedPassword);

        await this.deleteAllTokensbyEmail(email);

        return {
            message: 'Password changed successfully',
        }
    }

    async validateToken(email: string, token: string) {
        const existingToken = await this.getTokenByEmail(email);

        if(!existingToken) {
            throw new NotFoundException('No reset password token found for this email');
        }

        return existingToken.token === token;
    }

    async createToken({ email, token, expiresAt }: CreateForgetPasswordTokenDto) {
        await this.deleteAllTokensbyEmail(email); // to make sure no unique constraint error occurs

        if(!token) {
            token = generateToken();
        }

        const newToken = await this.passwordTokenModel.create({ email, token, expiresAt })

        return newToken
    }

    async getTokenByEmail(email: string) {
        const token = await this.passwordTokenModel.findOne({ email });

        return token;
    }

    async deleteAllTokensbyEmail(email: string) {
        await this.passwordTokenModel.deleteMany({ email });
    }
}
