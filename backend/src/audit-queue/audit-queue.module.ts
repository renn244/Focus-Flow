import { Global, Module } from '@nestjs/common';
import { AuditQueueService } from './audit-queue.service';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'audit-log-queue' })
  ],
  providers: [AuditQueueService],
  exports: [AuditQueueService],
})
export class AuditQueueModule {}
