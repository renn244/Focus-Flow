import { Test, TestingModule } from '@nestjs/testing';
import { AuditQueueService } from './audit-queue.service';

describe('AuditQueueService', () => {
  let service: AuditQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditQueueService],
    }).compile();

    service = module.get<AuditQueueService>(AuditQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
