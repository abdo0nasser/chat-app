import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { chat } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createChat(
    createChatDto: CreateChatDto,
    user_id: number,
  ): Promise<chat> {
    const chat = await this.prismaService.chat.create({
      data: {
        title: createChatDto.Title,
        description: createChatDto.Description,
        admin: {
          connect: {
            user_id: user_id,
          },
        },
      },
    });

    if (!chat) {
      this.logger.error('Chat - Create: Chat creation failed');
      throw new BadRequestException('Chat creation failed');
    }

    return chat;
  }

  async getChats(paginationDto: PaginationDto): Promise<chat[]> {
    const chats = await this.prismaService.chat.findMany({
      take: paginationDto.Limit,
      skip: (paginationDto.Page - 1) * paginationDto.Limit,
    });

    if (!chats) {
      this.logger.error('Chats - Get: Chat not found');
      throw new BadRequestException('Chat not found');
    }

    return chats;
  }
}
