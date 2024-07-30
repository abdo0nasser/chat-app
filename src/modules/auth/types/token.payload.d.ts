import { user } from '@prisma/client';
import { SerializedUser } from '../serialized-types/serialized-user';
import { ApiProperty } from '@nestjs/swagger';

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type TokenPayload = {
  user_id: number;
  username: string;
};
