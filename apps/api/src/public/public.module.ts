import { Module } from '@nestjs/common';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';

/**
 * PublicModule - Módulo de endpoints públicos sin autenticación.
 *
 * Proporciona resolución de etiquetas NFC y registro de eventos de analíticas
 * accesibles desde el exterior sin necesidad de token JWT.
 */
@Module({
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
