import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { hashPassword, verify } from 'src/utils/argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types/token.payload';
import { UserWithTokens } from './types/user-with-token.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserWithTokens> {
    const userData = {
      username: signupDto.Username,
      password: await hashPassword(signupDto.Password),
      email: signupDto.Email,
      full_name: signupDto.FullName,
      join_date: new Date(),
      dob: new Date(signupDto.BirthDate),
    };

    const user = await this.prismaService.user.create({
      data: userData,
    });

    if (!user) throw new BadRequestException();

    const tokens = await this.issueTokens(
      {
        sub: user.user_id,
        username: user.username,
      },
      'both',
    );
    return {
      user,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: loginDto.Username,
      },
    });

    if (!user)
      throw new BadRequestException('username or password is incorrect');
    else if (!verify(user.password, loginDto.Password))
      throw new BadRequestException('username or password is incorrect');
    const tokens = await this.issueTokens(
      {
        sub: user.user_id,
        username: user.username,
      },
      'both',
    );
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  private async issueTokens(
    payload: {
      sub: number;
      username: string;
    },
    type: 'refresh' | 'access' | 'both',
  ): Promise<Tokens> {
    let access_token, refresh_token;
    if (type === 'access' || type === 'both')
      access_token = await this.issueToken(payload, true);
    if (type === 'refresh' || type === 'both')
      refresh_token = await this.issueToken(payload, false);
    return {
      access_token,
      refresh_token,
    };
  }

  private async issueToken(
    payload: {
      sub: number;
      username: string;
    },
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
    return await this.jwtService.signAsync(payload, {
      expiresIn: expiration_time,
      secret,
    });
  }
}
