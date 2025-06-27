import { Module } from '@nestjs/common';
import { VerifyEmailTokenService } from './verify-email-token.service';
import { VerifyEmailTokenController } from './verify-email-token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VerifyEmailToken, verifyEmailTokenSchema } from 'src/schema/VerifyEmailToken';
import { UserModule } from 'src/user/user.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VerifyEmailToken.name,
        schema: verifyEmailTokenSchema
      }
    ]),
    UserModule, EmailModule,
  ],
  providers: [VerifyEmailTokenService],
  controllers: [VerifyEmailTokenController],
  exports: [VerifyEmailTokenService]
})
export class VerifyEmailTokenModule {}
