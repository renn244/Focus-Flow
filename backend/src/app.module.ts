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
import { ProjectsModule } from './projects/projects.module';
import { BoardModule } from './board/board.module';
import { ColumnModule } from './column/column.module';
import { TaskModule } from './task/task.module';
import { TeamModule } from './team/team.module';
import { AuditQueueModule } from './audit-queue/audit-queue.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ 
      isGlobal: true, 
      ttl: 60 * 1000
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      })
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 3000,
          attempts: 3,
        }
      })
    }),
    UserModule,
    AuthModule,
    EmailModule,
    VerifyEmailTokenModule,
    ForgetPasswordTokenModule,
    ProjectsModule,
    BoardModule,
    ColumnModule,
    TaskModule,
    TeamModule,
    AuditQueueModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
