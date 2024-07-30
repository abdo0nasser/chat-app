import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class LogoutDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'user id' })
  UserId: number;

  @IsString()
  @ApiProperty({ example: 'token', description: 'refresh token' })
  Token: string;
}
