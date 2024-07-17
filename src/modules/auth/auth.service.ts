import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { hash, verify } from 'src/utils/argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types/token.payload';
import { UserWithTokens } from './types/user-with-token.payload';
import { PrismaException } from 'src/exception-filters/prisma.filter';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserWithTokens> {
    try {
      // consist the user object
      const dob = signupDto.BirthDate ? new Date(signupDto.BirthDate) : null;
      const userData = {
        username: signupDto.Username,
        password: await hash(signupDto.Password),
        email: signupDto.Email,
        full_name: signupDto.FullName,
        join_date: new Date(),
        phone_number: signupDto.PhoneNumber,
        dob,
      };

      // this transaction is to ensure that the user is created and the tokens are issued (2 db operations)
      const data = await this.prismaService
        .$transaction(async (prisma) => {
          const user = await prisma.user.create({
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
        })
        .catch((e) => {
          this.logger.error(
            `error creating user with prisma code: ${e.code} in field: ${e.meta.target}`,
          );
          throw new PrismaException(e.code, e.meta.target);
        });

      return {
        user: data?.user,
        access_token: data?.tokens?.access_token,
        refresh_token: data?.tokens?.refresh_token,
      };
    } catch (e) {
      this.logger.error(`Error signing up : ${e}`);
      throw new BadRequestException(e);
    }
  }

  async loginLocal(loginDto: LoginDto): Promise<Tokens> {
    try {
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
    } catch (e) {
      this.logger.error('Error logging in with message: ', e.message);
      throw new BadRequestException(e.message);
    }
  }

  private async updatingRefreshToken(
    user_id: number,
    token: string,
  ): Promise<void> {
    try {
      await this.prismaService.user.update({
        where: {
          user_id,
        },
        data: {
          refresh_token: await hash(token),
        },
      });
    } catch (e) {
      this.logger.error(
        'updating refresh token failed with message: ',
        e.message,
      );
    }
  }

  private async issueTokens(
    payload: {
      sub: number;
      username: string;
    },
    type: 'refresh' | 'access' | 'both',
  ): Promise<Tokens> {
    try {
      let access_token, refresh_token;
      if (type === 'access' || type === 'both')
        access_token = await this.issueToken(payload, true);
      if (type === 'refresh' || type === 'both')
        refresh_token = await this.issueToken(payload, false);
      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      this.logger.error('issuing tokens failed with message: ', e.message);
      throw new BadRequestException(e.message);
    }
  }

  private async issueToken(
    payload: {
      sub: number;
      username: string;
    },
    isAccess: boolean,
  ): Promise<string> {
    try {
      let expiration_time: string;
      let secret: string;
      if (isAccess) {
        expiration_time = this.configService.get(
          'ACCESS_TOKEN_EXPIRATION_TIME',
        );
        secret = this.configService.get('ACCESS_TOKEN_SECRET');
      } else {
        expiration_time = this.configService.get(
          'REFRESH_TOKEN_EXPIRATION_TIME',
        );
        secret = this.configService.get('REFRESH_TOKEN_SECRET');
      }
      return await this.jwtService.signAsync(payload, {
        expiresIn: expiration_time,
        secret,
      });
    } catch (e) {
      this.logger.error('issue token failed with message: ', e.message);
      throw new BadRequestException(e.message);
    }
  }
}
