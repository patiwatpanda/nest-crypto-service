import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function firstError(errors: ValidationError[]): string {
  for (const error of errors) {
    const message = error.constraints
      ? Object.values(error.constraints)[0]
      : undefined;
    if (message) {
      return message;
    }
    if (error.children?.length) {
      return firstError(error.children);
    }
  }
  return 'VALIDATION_ERROR';
}

export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new HttpException(
        {
          successful: false,
          error_code: firstError(errors),
          data: null,
        },
        HttpStatus.OK,
      ),
  });
}
