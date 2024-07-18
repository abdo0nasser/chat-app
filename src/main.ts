import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filters/global.filter';

// All of your application code and any imports that should leverage
// OpenTelemetry automatic instrumentation must go here.

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('chat app')
    .setDescription('The chatting application API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get('BACKEND_PORT'));
  console.log(`Running on ${configService.get('BACKEND_BASE_URL')}`);
}
bootstrap();
