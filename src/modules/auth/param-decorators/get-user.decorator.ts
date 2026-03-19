import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { user } from '@prisma/client';

export const GetCurrentUser = createParamDecorator(
  (data: 'user_id' | 'username' | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;
    return request.user[data];
  },
);

export const GetFromCookie = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const cookie = request.cookies[data];
    if (!cookie)
      throw new BadRequestException('Refresh Token Cookie not found');
    return cookie;
  },
);
export const GetAccessToken = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    if (!token) throw new BadRequestException('Access Token not found');

    return token;
  },
);
