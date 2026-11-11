import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './passport/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import { GithubStrategy } from './passport/github.strategy';
import { VerifyEmailTokenModule } from 'src/verify-email-token/verify-email-token.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/schema/User.schema';
import { EmailModule } from 'src/email/email.module';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

@Module({
  imports: [
    UserModule, VerifyEmailTokenModule, EmailModule,
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15d' }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController, MfaController],
  providers: [AuthService, MfaService, LocalStrategy, GithubStrategy, JwtStrategy],
})
export class AuthModule {}
