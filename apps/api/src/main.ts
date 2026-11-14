import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap - Inicializa la aplicación NestJS.
 *
 * Configura:
 * - Prefijo global de la API (/api/v1)
 * - Validación global de DTOs con class-validator
 * - CORS para permitir peticiones del frontend
 * - Swagger/OpenAPI documentation
 */
async function bootstrap() {
  const port = process.env.API_PORT || 3001;
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API versionada
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para permitir peticiones del frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Taply API')
    .setDescription('API REST para Taply - Plataforma SaaS de páginas digitales con NFC y QR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/v1/docs`);
}

bootstrap();
