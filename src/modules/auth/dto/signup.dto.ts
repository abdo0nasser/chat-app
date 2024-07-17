import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsGoodPassword } from 'src/utils/custom-decorators/password.decorator';
import { IsGoodUsername } from 'src/utils/custom-decorators/username.decorator';

export class SignupDto {
  @ApiProperty({
    example: 'test_user',
    description: 'account username',
  })
  @IsGoodUsername()
  Username: string;

  @ApiProperty({
    example: 'pass1234',
    description: 'account password',
  })
  @IsGoodPassword()
  Password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'account full name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  FullName: string;

  @ApiProperty({
    example: 'mail@test.com',
    description: 'account email',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  Email: string;

  @ApiProperty({
    example: '+201122334455',
    description: 'account phone number',
  })
  @IsPhoneNumber()
  @MaxLength(10)
  @IsOptional()
  PhoneNumber?: string | null;
  
  @ApiProperty({
    example: '1990-8-17',
    description: 'account date of birth',
  })
  @IsDateString() //2022-09-27 18:00:00.000
  @IsOptional()
  BirthDate: Date | null;
}
