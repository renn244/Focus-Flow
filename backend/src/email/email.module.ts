import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        // Transport configuration for SMTP
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: Number(configService.get<string>('SMTP_PORT') || 1234),
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER') || "",
            pass: configService.get<string>('SMTP_PASSWORD') || ""
          },
        },
        // Default email settings
        defaults: {
          from: configService.get<string>('SMTP_FROM') || "",
        },
        // Template settings configure for handlebars
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          }
        }
      }),
      inject: [ConfigService],
    })
  ],
  providers: [EmailService],
})
export class EmailModule {}