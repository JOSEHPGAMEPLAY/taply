import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { BusinessesController } from './businesses.controller.js';
import { BusinessesService } from './businesses.service.js';

/**
 * BusinessesModule - Módulo de gestión de negocios.
 *
 * Principios SOLID aplicados:
 * - SRP: Encapsula toda la lógica de negocios en un módulo cohesivo.
 * - DIP: Depende de PrismaModule global para acceso a la base de datos.
 *
 * Componentes:
 * - BusinessesController: Maneja las peticiones HTTP
 * - BusinessesService: Contiene la lógica de negocio
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
