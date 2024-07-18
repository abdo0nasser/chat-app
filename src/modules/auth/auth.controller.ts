import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SerializedUser } from './serialized-types/serialized-user';
import { LoginDto } from './dto/login.dto';
import { Public } from './param-decorators/public.decorator';
import { sendSuccessResponse } from 'src/utils/success-response-genarator';
import {
  SwaggerFailureResponseExample,
  swaggerSuccessResponseExample,
} from 'src/utils/swagger-example-generator';
import { UserExample } from './swagger-examples/user.example';
import { LoginExample } from './swagger-examples/login.example';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOkResponse({
    description: 'Signup completed Successfully',
    schema: swaggerSuccessResponseExample(UserExample),
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async signup(@Body() signupDto: SignupDto) {
    const { user, access_token, refresh_token } =
      await this.authService.signup(signupDto);
    return sendSuccessResponse({
      user: new SerializedUser(user),
      access_token,
      refresh_token,
    });
  }

  @Post('login')
  @Public()
  @ApiOkResponse({
    description: 'Signup completed Successfully',
    schema: swaggerSuccessResponseExample(LoginExample),
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })  
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.loginLocal(loginDto);
    return sendSuccessResponse({
      AccessToken: tokens.access_token,
      RefreshToken: tokens.refresh_token,
    });
  }
}
