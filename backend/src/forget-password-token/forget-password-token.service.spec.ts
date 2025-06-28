import { Test, TestingModule } from '@nestjs/testing';
import { ForgetPasswordTokenService } from './forget-password-token.service';

describe('ForgetPasswordTokenService', () => {
  let service: ForgetPasswordTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForgetPasswordTokenService],
    }).compile();

    service = module.get<ForgetPasswordTokenService>(ForgetPasswordTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
