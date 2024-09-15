import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../param-decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { verifyToken } from './token-verifier';

@Injectable()
export class AuthGuard implements CanActivate {
  logger = new Logger(AuthGuard.name);
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    const payload = await verifyToken(token);
    if (!payload) return false;
    request['user'] = payload;

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
