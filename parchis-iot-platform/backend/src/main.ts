import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL') || 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(config.get<string>('PORT') || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`Parchis IoT backend listo en http://localhost:${port}`);
}

bootstrap();
