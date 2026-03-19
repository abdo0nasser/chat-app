import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export type FailurePayload = {
  errorMessage: string;
  errorTarget?: string;
};

export function sendFailureResponse(
  res: Response,
  statusCode: HttpStatus,
  data: FailurePayload,
) {
  res.status(statusCode).json({
    data,
  });
}
