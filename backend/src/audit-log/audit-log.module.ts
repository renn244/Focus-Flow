import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, auditLogSchema } from 'src/schema/AuditLog.schema';
import { AuditLogService } from './audit-log.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: AuditLog.name, schema: auditLogSchema }])],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class AuditLogModule {}
