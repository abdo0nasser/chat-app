import { ApiProperty } from '@nestjs/swagger';
import { chat } from '@prisma/client';

export class SerializedChat {
  @ApiProperty({
    example: '1',
    description: 'Chat ID',
  })
  Title: string;

  @ApiProperty({
    example: '1',
    description: 'Chat ID',
  })
  Description: string;

  @ApiProperty({
    example: '2021-09-20T00:00:00.000Z',
    description: 'Chat creation date',
  })
  CreatedAt: Date;

  constructor(partial: Partial<chat>) {
    this.Title = partial.title;
    this.Description = partial.description;
    this.CreatedAt = partial.created_at;
  }
}
