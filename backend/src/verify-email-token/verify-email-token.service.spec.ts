import { Test, TestingModule } from '@nestjs/testing';
import { VerifyEmailTokenService } from './verify-email-token.service';

describe('VerifyEmailTokenService', () => {
  let service: VerifyEmailTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyEmailTokenService],
    }).compile();

    service = module.get<VerifyEmailTokenService>(VerifyEmailTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
