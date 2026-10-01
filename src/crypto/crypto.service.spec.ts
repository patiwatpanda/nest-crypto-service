import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should encrypt and decrypt correctly', () => {
    const text = 'Hello NestJS';
    const encrypted = service.encryptData(text);
    expect(encrypted.successful).toBe(true);

    const decrypted = service.decryptData(
      encrypted.data!.data1,
      encrypted.data!.data2,
    );
    expect(decrypted.successful).toBe(true);
    expect(decrypted.data?.payload).toBe(text);
  });
});