import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap - Inicializa la aplicación NestJS.
 *
 * Configura:
 * - Prefijo global de la API (/api/v1)
 * - Validación global de DTOs con class-validator
 * - CORS para permitir peticiones del frontend
 */
async function bootstrap() {
  const port = process.env.API_PORT || 3001;
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API versionada
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Rechaza si hay propiedades no permitidas
      transform: true, // Transforma los datos a los tipos del DTO
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para permitir peticiones del frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
