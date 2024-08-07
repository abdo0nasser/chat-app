import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  Title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  Description: string;
}
