import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CryptoService {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    try {
      this.privateKey = fs.readFileSync(path.join(process.cwd(), 'keys/private.pem'), 'utf8');
      this.publicKey = fs.readFileSync(path.join(process.cwd(), 'keys/public.pem'), 'utf8');
    } catch (e) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
      this.privateKey = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
      this.publicKey = publicKey.export({ type: 'pkcs1', format: 'pem' }).toString();
    }
  }

  encryptData(payload: string) {
    try {
      const aesKey = crypto.randomBytes(32).toString('hex');
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(aesKey, 'hex'), iv);
      let encryptedPayload = cipher.update(payload, 'utf8', 'hex');
      encryptedPayload += cipher.final('hex');
      const data2 = iv.toString('hex') + ':' + encryptedPayload;

      const data1 = crypto
        .privateEncrypt(
          { key: this.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
          Buffer.from(aesKey, 'utf8'),
        )
        .toString('base64');

      return { successful: true, error_code: '', data: { data1, data2 } };
    } catch (error: any) {
      return { successful: false, error_code: error.message || 'ENCRYPTION_FAILED', data: null };
    }
  }

  decryptData(data1: string, data2: string) {
    try {
      const decryptedAesBuffer = crypto.publicDecrypt(
        { key: this.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(data1, 'base64'),
      );
      const aesKey = decryptedAesBuffer.toString('utf8');

      const parts = data2.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(aesKey, 'hex'), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return { successful: true, error_code: '', data: { payload: decrypted } };
    } catch (error: any) {
      return { successful: false, error_code: error.message || 'DECRYPTION_FAILED', data: null };
    }
  }
}