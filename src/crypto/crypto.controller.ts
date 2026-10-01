import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CryptoService } from './crypto.service';

class EncryptPayloadDto {
  @ApiProperty({
    example: 'Hello World',
    description: 'string | required | 0 - 2000 characters',
    minLength: 0,
    maxLength: 2000,
  })
  @MaxLength(2000, {
    message: 'payload must be between 0 and 2000 characters',
  })
  @IsString({ message: 'payload must be a string' })
  @IsDefined({ message: 'payload is required' })
  payload: string;
}

class DecryptPayloadDto {
  @ApiProperty({ example: 'base64string...', description: 'string | required' })
  @IsString({ message: 'data1 must be a string' })
  @IsNotEmpty({ message: 'data1 is required' })
  data1: string;

  @ApiProperty({ example: 'iv:hexstring...', description: 'string | required' })
  @IsString({ message: 'data2 must be a string' })
  @IsNotEmpty({ message: 'data2 is required' })
  data2: string;
}

class EncryptDataDto {
  @ApiProperty({ example: 'base64string...' })
  data1: string;

  @ApiProperty({ example: 'iv:hexstring...' })
  data2: string;
}

class EncryptResponseDto {
  @ApiProperty({ example: true })
  successful: boolean;

  @ApiProperty({ example: '' })
  error_code: string;

  @ApiProperty({ type: EncryptDataDto, nullable: true })
  data: EncryptDataDto | null;
}

class DecryptDataDto {
  @ApiProperty({ example: 'Hello World' })
  payload: string;
}

class DecryptResponseDto {
  @ApiProperty({ example: true })
  successful: boolean;

  @ApiProperty({ example: '' })
  error_code: string;

  @ApiProperty({ type: DecryptDataDto, nullable: true })
  data: DecryptDataDto | null;
}

@ApiTags('Crypto API')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt string payload' })
  @ApiOkResponse({ type: EncryptResponseDto })
  getEncryptData(@Body() body: EncryptPayloadDto) {
    return this.cryptoService.encryptData(body.payload);
  }

  @Post('get-decrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt data1 and data2' })
  @ApiOkResponse({ type: DecryptResponseDto })
  getDecryptData(@Body() body: DecryptPayloadDto) {
    return this.cryptoService.decryptData(body.data1, body.data2);
  }
}
