import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';

/**
 * TemplatesModule - Módulo de gestión de templates globales.
 *
 * Componentes:
 * - TemplatesController: Maneja las peticiones HTTP
 * - TemplatesService: Contiene la lógica de negocio
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
