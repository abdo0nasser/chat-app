import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { chat } from '@prisma/client';

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

  async getChat(chat_id: number): Promise<chat> {
    const chat = await this.prismaService.chat.findUnique({
      where: {
        chat_id: chat_id,
      },
    });

    if (!chat) {
      this.logger.error('Chat - Get: Chat not found');
      throw new BadRequestException('Chat not found');
    }

    return chat;
  }
}
