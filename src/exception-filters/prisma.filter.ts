import { HttpException, HttpStatus } from '@nestjs/common';

export class PrismaException extends HttpException {
  constructor(prismaCode: string, field: string) {
    super(
      'Error in prisma with code: ' + prismaCode + ' in field: ' + field,
      HttpStatus.BAD_REQUEST,
    );
  }
}
