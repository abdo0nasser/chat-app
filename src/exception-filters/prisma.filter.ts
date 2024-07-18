import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import {
  PrismaErrorMessage,
  PrismaErrorStatusCode,
} from './prisma-error-types/prisma-error';
import { sendFailureResponse } from 'src/utils/fail-response-generator';

// Got this from docs and logging output
export type PrismaMeta = {
  target: string;
  field_name: string;
};
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    sendFailureResponse(
      response,
      PrismaErrorStatusCode[exception.code] || HttpStatus.BAD_REQUEST,
      {
        errorMessage: PrismaErrorMessage[exception.code] || exception.code,
        errorTarget:
          (exception.meta as PrismaMeta)?.target ||
          (exception.meta as PrismaMeta)?.field_name,
      },
    );
  }
}
