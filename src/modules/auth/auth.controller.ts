import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SerializedUser } from './serialized-types/serialized-user';
import { LoginDto } from './dto/login.dto';
import { Public } from './param-decorators/public.decorator';
import {
  sendRefreshToken as addTokenToCookie,
  sendSuccessResponse,
} from 'src/utils/success-response-genarator';
import { swaggerSuccessResponseExample } from 'src/utils/swagger-example-generator';
import { UserExample } from './swagger-examples/user.example';
import { LoginExample } from './swagger-examples/login.example';
import {
  GetCurrentUser,
  GetFromCookie,
} from './param-decorators/get-user.decorator';

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
  async signup(@Res({ passthrough: true }) res, @Body() signupDto: SignupDto) {
    const { user, access_token, refresh_token } =
      await this.authService.signup(signupDto);
    addTokenToCookie(res, refresh_token, 'refresh_token');
    addTokenToCookie(res, access_token, 'access_token');
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
  async login(@Res({ passthrough: true }) res, @Body() loginDto: LoginDto) {
    const { access_token, refresh_token } =
      await this.authService.loginLocal(loginDto);
    addTokenToCookie(res, refresh_token, 'refresh_token');
    addTokenToCookie(res, access_token, 'access_token');
    return sendSuccessResponse({
      AccessToken: access_token,
      RefreshToken: refresh_token,
    });
  }

  @Post('logout')
  @ApiOkResponse({
    description: 'Logout completed Successfully',
    schema: swaggerSuccessResponseExample({ type: 'boolean', example: true }),
  })
  async logout(
    @Res({ passthrough: true }) res,
    @GetCurrentUser('username') username,
    @GetFromCookie('access_token') access_token,
  ) {
    if (!username || !access_token) {
      return sendSuccessResponse(false);
    }
    await res.clearCookie('refresh_token');
    await res.clearCookie('access_token');

    return sendSuccessResponse(
      await this.authService.logout({
        Username: username,
        Token: access_token,
      }),
    );
  }

  @Post('refresh')
  @ApiOkResponse({
    description: 'Token refreshed Successfully',
    schema: swaggerSuccessResponseExample(LoginExample),
  })
  async refresh(
    @Res({ passthrough: true }) res,
    @GetFromCookie('refresh_token') refresh_token,
  ) {
    const tokens = await this.authService.refresh(refresh_token);
    addTokenToCookie(res, tokens.access_token, 'access_token');
    return sendSuccessResponse({
      AccessToken: tokens.access_token,
      RefreshToken: tokens.refresh_token,
    });
  }
}
