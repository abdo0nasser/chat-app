import { ApiProperty } from '@nestjs/swagger';
import { IsGoodPassword } from 'src/utils/custom-decorators/password.decorator';
import { IsGoodUsername } from 'src/utils/custom-decorators/username.decorator';

export class LoginDto {
  @ApiProperty({
    example: 'test_user',
    description: 'account username',
  })
  @IsGoodUsername()
  Username: string;

  @ApiProperty({
    example: 'Pass1234',
    description: 'account password',
  })
  @IsGoodPassword()
  Password: string;
}
