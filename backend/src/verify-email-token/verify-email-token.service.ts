import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { VerifyEmailToken, VerifyEmailTokenDocument } from 'src/schema/VerifyEmailToken';
import { randomBytes } from 'crypto';
import { UserService } from 'src/user/user.service';
import { CreateVerifyTokenDto } from './dto/create-verify-token.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class VerifyEmailTokenService {
    constructor(
        @InjectModel(VerifyEmailToken.name) private verifyEmailTokenModel: Model<VerifyEmailTokenDocument>,
        private readonly emailService: EmailService,
        private readonly userService: UserService
    ) {}

    generateToken() {
        return randomBytes(32).toString('hex');
    }

    async create({ email, userId, token, expiresAt }: CreateVerifyTokenDto) {
        if(!token) {
            // if no token is provided, generate a new one
            token = this.generateToken();
        }

        const newToken = await this.verifyEmailTokenModel.create({ email, token, userId, expiresAt });
        
        return newToken; 
    }

    async verify(token: string) {
        const emailToken = await this.verifyEmailTokenModel.findOne({ token });

        if(!emailToken) {
            throw new NotFoundException('Invalid or Does not exist verification token');
        }

        if(emailToken.expiresAt < new Date()) {
            throw new BadRequestException('Verification token has expired');
        }

        const isTokenValid = token === emailToken.token;

        if(!isTokenValid) {
            throw new BadRequestException('Invalid verification token');
        }
        
        // update the user's email verification status here
        await this.userService.update(new Types.ObjectId(emailToken.userId), { emailVerified: true });

        // delete the token after successful verification
        await this.deleteVerifyEmailToken(emailToken._id);

        return { 
            message: 'Email verified successfully',
            action: 'redirect', redirectUrl: '/login'
        };
    }

    async sendEmailVerification(email: string, userId: Types.ObjectId) {
        const token = await this.create({ email, userId });
        const confirmationUrl = `${process.env.CLIENT_BASE_URL}/verify-email?token=${token.token}&email=${token.email}`

        if (!token) {
            throw new ServiceUnavailableException('Failed to create verification token');
        }

        // send mail to user with the token
        await this.emailService.sendEmail({
            to: email, subject: 'Verify your email',
            template: 'email-confirmation', context: { email: token.email, confirmationUrl }
        })

        return {
            message: 'Verification email sent successfully',
        }
    }

    async resend(email: string) {
        const token = await this.verifyEmailTokenModel.findOne({ email });

        if(!token) {
            throw new NotFoundException('No verification token found for this email');
        }

        const confirmationUrl = `${process.env.CLIENT_BASE_URL}/verify-email?token=${token.token}&email=${token.email}`        
        await this.emailService.sendEmail({
            to: token.email,  subject: 'Verify your email',
            template: 'email-confirmation', context: { email: token.email, confirmationUrl }
        })

        return {
            message: 'Verification email resent successfully',
        }
    }

    async newVerification(email: string) {
        const existingToken = await this.verifyEmailTokenModel.findOne({ email });
        if(existingToken) {
            throw new BadRequestException('A verification token already exists for this email');
        }

        const user = await this.userService.findByEmail(email);
        if(!user) {
            throw new NotFoundException('User not found with this email');
        }

        const token = await this.create({ email: user.email, userId: user._id });
        const confirmationUrl = `${process.env.CLIENT_BASE_URL}/verify-email?token=${token.token}&email=${token.email}`;

        await this.emailService.sendEmail({
            to: token.email, subject: 'Verify your email',
            template: 'email-confirmation', context: { email: token.email, confirmationUrl }
        });

        return {
            message: 'New verification email sent successfully',
        }
    }

    async deleteVerifyEmailToken(_id: Types.ObjectId): Promise<DeleteResult> {
        const deletedToken = await this.verifyEmailTokenModel.deleteOne({ _id });
        return deletedToken;
    }
}
