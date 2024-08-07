import { ApiProperty } from '@nestjs/swagger';
import { user } from '@prisma/client';

export class SerializedUser {
  @ApiProperty({
    example: 'John Doe',
    description: 'account full name',
  })
  FullName: string;

  @ApiProperty({
    example: 'test_user',
    description: 'account username',
  })
  Username: string;

  @ApiProperty({
    example: '20-9-2002',
    description: 'account date of birth',
  })
  DateOfBirth: Date;

  @ApiProperty({
    example: 'mail@test.com',
    description: 'account email',
  })
  Email: string;

  constructor(partial: Partial<user>) {
    this.Email = partial.email;
    this.DateOfBirth = partial.dob;
    this.Username = partial.username;
    this.FullName = partial.full_name;
  }
}
