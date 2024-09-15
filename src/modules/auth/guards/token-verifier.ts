import { UnauthorizedException } from '@nestjs/common';

export async function verifyToken(token: string) {
  if (!token) {
    throw new UnauthorizedException();
  }
  try {
    if (await this.cacheService.get(token)) {
      return false;
    }
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
    });

    return payload;
  } catch (e) {
    this.logger.error('Authorization Error: ' + e.message);
    throw new UnauthorizedException();
  }
}
