import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

/**
 * Datos de una entrada de auditoría.
 */
export interface AuditLogData {
  actorId?: string;
  entity: string;
  entityId?: string;
  action: string;
  details?: Record<string, unknown>;
}

/**
* Servicio de auditoría para registrar operaciones críticas.
*
* Principios SOLID aplicados:
* - Single Responsibility: Solo escribe entradas en AuditLog.
* - Dependency Inversion: Depende de PrismaClient (abstracción).
*/
@Injectable()
export class AuditService {
  constructor(
    @Inject(PRISMA_CLIENT) private prisma: PrismaClient,
  ) {}

  /**
   * Registra una entrada en el log de auditoría.
   *
   * @param data - Datos de la operación a registrar
   * @returns La entrada creada en AuditLog
   */
  async log(data: AuditLogData) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          entity: data.entity,
          entityId: data.entityId,
          action: data.action as any,
          details: data.details as any,
        },
      });
    } catch (error) {
      // No romper el flujo si falla la auditoría
      console.error('Audit log error:', error);
      return null;
    }
  }
}
