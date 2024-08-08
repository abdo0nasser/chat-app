import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  Page: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  Limit: number = 5;
}
