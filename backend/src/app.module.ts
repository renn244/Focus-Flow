import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { SentryModule } from '@sentry/nestjs/setup';
import { EmailModule } from './email/email.module';
import { VerifyEmailTokenModule } from './verify-email-token/verify-email-token.module';
import { ForgetPasswordTokenModule } from './forget-password-token/forget-password-token.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 60 * 1000 }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      })
    }),
    UserModule,
    AuthModule,
    EmailModule,
    VerifyEmailTokenModule,
    ForgetPasswordTokenModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
