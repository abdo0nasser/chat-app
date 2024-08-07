import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { sendSuccessResponse } from 'src/utils/success-response-genarator';
import { GetCurrentUser } from '../auth/param-decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { SerializedChat } from './serialized-types/serialized-chat';

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
}
