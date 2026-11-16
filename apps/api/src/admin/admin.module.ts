import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * AdminModule - Módulo de gestión de usuarios del sistema.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo agrupa los componentes de administración de usuarios.
 * - DIP: Importa las dependencias necesarias (PrismaModule).
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
