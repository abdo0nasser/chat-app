import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// All of your application code and any imports that should leverage
// OpenTelemetry automatic instrumentation must go here.

async function bootstrap() {
  const config = new ConfigService();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  await app.listen(config.get('BACKEND_PORT'), () =>
    console.log(`Running on ${config.get('BACKEND_BASE_URL')}`),
  );
}
bootstrap();
 