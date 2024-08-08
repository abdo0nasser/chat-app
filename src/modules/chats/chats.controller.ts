import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
}
