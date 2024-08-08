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

  constructor(partial: Partial<chat>) {
    this.Title = partial.title;
    this.Description = partial.description ? partial.description : '';
  }
}
