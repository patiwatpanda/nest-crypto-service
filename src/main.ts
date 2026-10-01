import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createValidationPipe } from './validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(createValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Crypto Service API')
    .setDescription('API for encryption and decryption')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3003);
  console.log('App running on http://localhost:3000');
  console.log('Swagger UI on http://localhost:3000/api-docs');
}
bootstrap();