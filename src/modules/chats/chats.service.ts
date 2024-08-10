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
    const chat = await this.prismaService.$transaction(async (prisma) => {
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

      const adminAdded = await prisma.user_chat.create({
        data: {
          user: {
            connect: {
              user_id,
            },
          },
          chat: {
            connect: {
              chat_id: chat.chat_id,
            },
          },
        },
      });

      if (!adminAdded) {
        this.logger.error('Chat - Create: admin not added to chat');
        throw new BadRequestException('admin not added to chat');
      }

      return chat;
    });

    if (!chat) {
      this.logger.error('Chat - Create: Chat creation failed');
      throw new BadRequestException('Chat creation failed');
    }

    return chat;
  }

  async getChats(paginationDto: PaginationDto): Promise<chat[]> {
    const chats = await this.prismaService.chat.findMany({
      take: paginationDto.limit,
      skip: (paginationDto.page - 1) * paginationDto.limit,
    });

    if (!chats) {
      this.logger.error('Chats - Get: Chat not found');
      throw new BadRequestException('Chat not found');
    }

    return chats;
  }

  async getChatsByName(
    paginationDto: PaginationDto,
    name: string,
  ): Promise<chat[]> {
    const chats = await this.prismaService.chat.findMany({
      where: {
        title: {
          contains: name,
        },
      },
      take: paginationDto.limit,
      skip: (paginationDto.page - 1) * paginationDto.limit,
    });

    if (!chats) {
      this.logger.error('Chats - Get: Chat not found');
      throw new BadRequestException('Chat not found');
    }

    return chats;
  }

  async joinChat(user_id: number, chat_id: number): Promise<boolean> {
    const chat = await this.prismaService.$transaction(async (prisma) => {
      const chat = await prisma.chat.findUnique({
        where: {
          chat_id,
        },
      });

      if (!chat) {
        this.logger.error('Chat - Join: Chat not found');
        throw new BadRequestException('Chat not found');
      }

      const isJoined = await prisma.user_chat.findFirst({
        where: {
          chat_id,
          user_id,
        },
      });

      if (isJoined) {
        this.logger.error('Chat - Join: User already joined chat');
        throw new BadRequestException('User already joined chat');
      }

      const addedUser = await prisma.user_chat.create({
        data: {
          user: {
            connect: {
              user_id,
            },
          },
          chat: {
            connect: {
              chat_id,
            },
          },
        },
      });

      if (!addedUser) {
        this.logger.error('Chat - Join: User not added to chat');
        throw new BadRequestException('User not added to chat');
      }

      const updatedChatCount = await prisma.chat.update({
        where: {
          chat_id,
        },
        data: {
          users_count: {
            increment: 1,
          },
        },
      });

      if (!updatedChatCount) {
        this.logger.error('Chat - Join: Chat count not updated');
        throw new BadRequestException('Chat count not updated');
      }

      return chat;
    });

    if (!chat) {
      this.logger.error('Chat - Join: cannot join chat');
      throw new BadRequestException('Cannot join chat');
    }

    return true;
  }

  async leaveChat(user_id: number, chat_id: number): Promise<boolean> {
    const chat = await this.prismaService.$transaction(async (prisma) => {
      const chat = await prisma.chat.findUnique({
        where: {
          chat_id,
        },
      });

      if (!chat) {
        this.logger.error('Chat - Join: Chat not found');
        throw new BadRequestException('Chat not found');
      }

      if (chat.admin_id === user_id) {
        this.logger.error(
          'Chat - Join: Owner cannot leave chat but only remove it',
        );
        throw new BadRequestException(
          'Owner cannot leave chat but only remove it',
        );
      }

      const isJoined = await prisma.user_chat.findFirst({
        where: {
          chat_id,
          user_id,
        },
      });

      if (!isJoined) {
        this.logger.error('Chat - Join: User is not in the chat');
        throw new BadRequestException('User is not in the chat');
      }

      const leftUser = await prisma.user_chat.delete({
        where: {
          user_id_chat_id: {
            chat_id,
            user_id,
          },
        },
      });

      if (!leftUser) {
        this.logger.error('Chat - Join: User not removed from the chat');
        throw new BadRequestException('User not removed from the chat');
      }

      const updatedChatCount = await prisma.chat.update({
        where: {
          chat_id,
        },
        data: {
          users_count: {
            decrement: 1,
          },
        },
      });

      if (!updatedChatCount) {
        this.logger.error('Chat - Join: Chat count not updated');
        throw new BadRequestException('Chat count not updated');
      }

      return chat;
    });

    if (!chat) {
      this.logger.error('Chat - Join: cannot join chat');
      throw new BadRequestException('Cannot join chat');
    }

    return true;
  }

  async deleteChat(user_id: number, chat_id: number): Promise<boolean> {
    const chatDeleted = await this.prismaService.$transaction(
      async (prisma) => {
        const chat = await prisma.chat.findUnique({
          where: {
            chat_id,
          },
        });

        if (!chat) {
          this.logger.error('Chat - Delete: Chat not found');
          throw new BadRequestException('Chat not found');
        }

        if (chat.admin_id !== user_id) {
          this.logger.error('Chat - Delete: User is not the owner of the chat');
          throw new BadRequestException('User is not the owner of the chat');
        }

        const deletedUserChat = await prisma.user_chat.deleteMany({
          where: {
            chat_id,
          },
        });

        if (!deletedUserChat) {
          this.logger.error('Chat - Delete: User chat not deleted');
          throw new BadRequestException('User chat not deleted');
        }

        const deletedChat = await prisma.chat.delete({
          where: {
            chat_id,
          },
        });

        if (!deletedChat) {
          this.logger.error('Chat - Delete: Chat not deleted');
          throw new BadRequestException('Chat not deleted');
        }

        return chat;
      },
    );

    if (!chatDeleted) {
      this.logger.error('Chat - Delete: cannot delete chat');
      throw new BadRequestException('Cannot delete chat');
    }

    return true;
  }
}
