import { Module } from '@nestjs/common';
import { ForgetPasswordTokenService } from './forget-password-token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordToken, passwordTokenSchema } from 'src/schema/PasswordToken';
import { EmailModule } from 'src/email/email.module';
import { ForgetPasswordTokenController } from './forget-password-token.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PasswordToken.name,
        schema: passwordTokenSchema
      }
    ]),
    EmailModule, UserModule,
  ],
  providers: [ForgetPasswordTokenService],
  controllers: [ForgetPasswordTokenController]
})
export class ForgetPasswordTokenModule {}
