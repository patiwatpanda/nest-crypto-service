import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createValidationPipe } from '../validation.pipe';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

describe('CryptoController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [CryptoService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('encrypts a payload and decrypts it back', async () => {
    const encrypted = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: 'Hello World' })
      .expect(200);

    expect(encrypted.body).toEqual({
      successful: true,
      error_code: '',
      data: {
        data1: expect.any(String),
        data2: expect.any(String),
      },
    });

    const decrypted = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send(encrypted.body.data)
      .expect(200);

    expect(decrypted.body).toEqual({
      successful: true,
      error_code: '',
      data: { payload: 'Hello World' },
    });
  });

  it('accepts an empty payload', async () => {
    const encrypted = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: '' })
      .expect(200);

    expect(encrypted.body.successful).toBe(true);

    const decrypted = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send(encrypted.body.data)
      .expect(200);

    expect(decrypted.body.data.payload).toBe('');
  });

  it('rejects a payload longer than 2000 characters', async () => {
    const response = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: 'a'.repeat(2001) })
      .expect(200);

    expect(response.body).toEqual({
      successful: false,
      error_code: 'payload must be between 0 and 2000 characters',
      data: null,
    });
  });

  it('rejects a missing payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({})
      .expect(200);

    expect(response.body).toEqual({
      successful: false,
      error_code: 'payload is required',
      data: null,
    });
  });

  it('rejects decrypt requests that omit data1 or data2', async () => {
    const missingData1 = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({ data2: 'value' })
      .expect(200);

    expect(missingData1.body).toEqual({
      successful: false,
      error_code: 'data1 is required',
      data: null,
    });

    const missingData2 = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({ data1: 'value' })
      .expect(200);

    expect(missingData2.body).toEqual({
      successful: false,
      error_code: 'data2 is required',
      data: null,
    });
  });
});
