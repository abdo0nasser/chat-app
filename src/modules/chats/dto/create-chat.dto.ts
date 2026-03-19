import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  Title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  Description: string;
}
