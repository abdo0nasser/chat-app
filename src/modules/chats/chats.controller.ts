import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { sendSuccessResponse } from 'src/utils/success-response-genarator';
import { GetCurrentUser } from '../auth/param-decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { SerializedChat } from './serialized-types/serialized-chat';
import { PaginationDto } from 'src/common/pagination.dto';

@Controller('chats')
@ApiTags('chats')
@UseInterceptors(ClassSerializerInterceptor)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('')
  @ApiOkResponse({
    description: 'Chat created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @GetCurrentUser('user_id') user_id,
  ) {
    return sendSuccessResponse(
      new SerializedChat(
        await this.chatsService.createChat(createChatDto, user_id),
      ),
    );
  }

  @Get('')
  @ApiOkResponse({
    description: 'Chats fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async getChats(@Query() paginationDto: PaginationDto) {
    return sendSuccessResponse(
      (await this.chatsService.getChats(paginationDto)).map(
        (chat) => new SerializedChat(chat),
      ),
    );
  }

  @Get('find')
  @ApiOkResponse({
    description: 'Chats fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async getChatsByName(
    @Query() paginationDto: PaginationDto,
    @Query('q') title: string,
  ) {
    return sendSuccessResponse(
      (await this.chatsService.getChatsByName(paginationDto, title)).map(
        (chat) => new SerializedChat(chat),
      ),
    );
  }

  @Post('join/:chat_id')
  @ApiOkResponse({
    description: 'Chat joined successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async joinChat(
    @GetCurrentUser('user_id') user_id: number,
    @Param('chat_id') chat_id: number,
  ) {
    return sendSuccessResponse({
      joined: await this.chatsService.joinChat(user_id, chat_id),
    });
  }

  @Delete('leave/:chat_id')
  @ApiNoContentResponse({
    description: 'Chat left successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async leaveChat(
    @GetCurrentUser('user_id') user_id: number,
    @Param('chat_id') chat_id: number,
  ) {
    await this.chatsService.leaveChat(user_id, chat_id);
  }

  @Delete(':chat_id')
  @ApiNoContentResponse({
    description: 'Chat deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async deleteChat(
    @GetCurrentUser('user_id') user_id: number,
    @Param('chat_id') chat_id: number,
  ) {
    await this.chatsService.deleteChat(user_id, chat_id);
  }
}
