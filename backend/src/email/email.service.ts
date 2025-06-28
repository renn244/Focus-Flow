import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly mailerService: MailerService,
    ) {}

    async sendEmail(params: {
        subject: string;
        template: string;
        to: string;
        context: ISendMailOptions['context'];
    }) {
        try {
            const emailOptions: ISendMailOptions = {
                to: params.to, subject: params.subject, 
                template: params.template, 
                context: params.context
            }

            const response = await this.mailerService.sendMail(emailOptions);
            this.logger.log(`Email sent successfully to ${params.to}`);
        } catch (error) {
            Sentry.captureException(error);
            console.log(error)
            throw new InternalServerErrorException('Failed to send email');
        }        
    }
}
