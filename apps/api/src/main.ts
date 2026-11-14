import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.API_PORT || 3001;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
