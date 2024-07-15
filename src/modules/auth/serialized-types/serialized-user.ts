import { ApiProperty } from '@nestjs/swagger';
import { user } from '@prisma/client';
import { Exclude } from 'class-transformer';

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

  @Exclude()
  password: string;

  @Exclude()
  join_date: string;

  @Exclude()
  id: number;

  constructor(partial: Partial<user>) {
    this.Email = partial.email;
    this.DateOfBirth = partial.dob;
    this.Username = partial.username;
    this.FullName = partial.full_name;
  }
}
