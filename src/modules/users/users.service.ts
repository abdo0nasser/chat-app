import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  findOne(username: string) {
    const user = this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  findAll(paginationDto: PaginationDto) {
    const users = this.prismaService.user.findMany({
      skip: paginationDto.page * paginationDto.limit,
      take: paginationDto.limit,
    });
    if (!users) throw new BadRequestException('No users found');
    return users;
  }
}
