import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @ApiProperty({ example: 1, description: 'user id' })
  Username: string;

  @IsString()
  @ApiProperty({ example: 'token', description: 'refresh token' })
  Token: string;
}
