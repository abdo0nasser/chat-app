import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { hash, verify } from 'src/utils/argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload, Tokens } from './types/token.payload';
import { UserWithTokens } from './types/user-with-token.payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserWithTokens> {
    // consist the user object
    const dob = signupDto.BirthDate ? new Date(signupDto.BirthDate) : null;
    const userData = {
      username: signupDto.Username,
      password: await hash(signupDto.Password),
      email: signupDto.Email,
      full_name: signupDto.FullName,
      join_date: new Date(),
      phone_number: signupDto.PhoneNumber || null,
      dob,
    };

    // this transaction is to ensure that the user is created and the tokens are issued (2 db operations)
    const data = await this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: userData,
      });

      const tokens = await this.issueTokens(
        {
          sub: user.user_id,
          username: user.username,
        },
        'both',
        prisma,
      );

      // put tokens with the user data
      await prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          refresh_token: await hash(tokens.refresh_token),
        },
      });
      return { user, tokens };
    });

    if (!data) {
      this.logger.error('Auth - Signup: error creating user');
      throw new BadRequestException('error creating user');
    }

    return {
      user: data?.user,
      access_token: data?.tokens?.access_token,
      refresh_token: data?.tokens?.refresh_token,
    };
  }

  async loginLocal(loginDto: LoginDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: loginDto.Username,
      },
    });

    if (!user || !verify(user.password, loginDto.Password)) {
      this.logger.error('Auth - Login: username or password is incorrect');
      throw new UnauthorizedException('username or password is incorrect');
    }

    const tokens = await this.issueTokens(
      {
        sub: user.user_id,
        username: user.username,
      },
      'both',
    );

    if (!tokens) {
      this.logger.error('Auth - Login: error issuing tokens');
      throw new UnauthorizedException('error issuing tokens');
    }

    this.logger.log('Auth - Login: user logged in: ' + user.username);

    return {
      access_token: tokens?.access_token,
      refresh_token: tokens?.refresh_token,
    };
  }

  private async updateRefreshToken(
    user_id: number,
    token: string,
    prisma = null,
  ): Promise<void> {
    const prismaObject = prisma || this.prismaService;
    await prismaObject.user.update({
      where: {
        user_id,
      },
      data: {
        refresh_token: await hash(token),
      },
    });
  }

  private async issueTokens(
    payload: TokenPayload,
    type: 'refresh' | 'access' | 'both',
    prisma = null,
  ): Promise<Tokens> {
    let access_token: string, refresh_token: string;
    if (type === 'access' || type === 'both')
      access_token = await this.issueToken(payload, true);
    if (type === 'refresh' || type === 'both') {
      refresh_token = await this.issueToken(payload, false);
      await this.updateRefreshToken(payload.sub, refresh_token, prisma);
    }
    return {
      access_token,
      refresh_token,
    };
  }

  private async issueToken(
    payload: TokenPayload,
    isAccess: boolean,
  ): Promise<string> {
    let expiration_time: string;
    let secret: string;
    if (isAccess) {
      expiration_time = this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME');
      secret = this.configService.get('ACCESS_TOKEN_SECRET');
    } else {
      expiration_time = this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME');
      secret = this.configService.get('REFRESH_TOKEN_SECRET');
    }
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: expiration_time,
      secret,
    });

    return token;
  }
}
