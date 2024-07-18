import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { HttpExceptionFilter } from './exception-filters/global.filter';
import { PrismaExceptionFilter } from './exception-filters/prisma.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
