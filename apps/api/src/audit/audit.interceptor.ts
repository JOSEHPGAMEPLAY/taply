import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service.js';

/**
* Mapeo de rutas HTTP a entidades y acciones de auditoría.
* Permite identificar automáticamente qué operación se está ejecutando.
*/
const ROUTE_MAP: Record<string, { entity: string; action: string }> = {
  'POST /auth/register': { entity: 'Auth', action: 'CREATE' },
  'POST /auth/login': { entity: 'Auth', action: 'LOGIN' },
  'POST /auth/refresh': { entity: 'Auth', action: 'LOGIN' },
  'GET /auth/me': { entity: 'Auth', action: 'UPDATE' },
  'POST /businesses': { entity: 'Business', action: 'CREATE' },
  'GET /businesses': { entity: 'Business', action: 'UPDATE' },
  'PATCH /businesses': { entity: 'Business', action: 'UPDATE' },
  'DELETE /businesses': { entity: 'Business', action: 'DELETE' },
  'POST /pages': { entity: 'Page', action: 'CREATE' },
  'GET /pages': { entity: 'Page', action: 'UPDATE' },
  'PATCH /pages': { entity: 'Page', action: 'UPDATE' },
  'DELETE /pages': { entity: 'Page', action: 'DELETE' },
  'POST /pages/publish': { entity: 'Page', action: 'PUBLISH' },
  'POST /nfc-tags': { entity: 'NfcTag', action: 'CREATE' },
  'GET /nfc-tags': { entity: 'NfcTag', action: 'UPDATE' },
  'POST /nfc-tags/assign': { entity: 'NfcTag', action: 'ASSIGN' },
  'POST /nfc-tags/scan': { entity: 'NfcTag', action: 'UPDATE' },
  'POST /billing/products': { entity: 'Billing', action: 'CREATE' },
  'POST /billing/orders': { entity: 'Billing', action: 'PAYMENT' },
  'POST /billing/payments': { entity: 'Billing', action: 'PAYMENT' },
  'POST /qr/generate': { entity: 'QrCode', action: 'CREATE' },
  'GET /qr': { entity: 'QrCode', action: 'UPDATE' },
};

/**
* Interceptor global de auditoría.
*
* Captura automáticamente todas las operaciones críticas y las registra
* en el log de auditoría con el usuario autenticado, la entidad y la acción.
*
* Principios SOLID aplicados:
* - Single Responsibility: Solo intercepta requests y registra auditoría.
* - Open/Closed: Se puede extender el ROUTE_MAP sin modificar el interceptor.
*/
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Intercepta la respuesta de cada request y registra la operación en AuditLog.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const path = request.url || '';

    // Construir la clave de búsqueda (ej: "POST /businesses")
    const routeKey = `${method} ${this.normalizePath(path)}`;

    // Buscar en el mapeo de rutas
    const mapping = this.findMapping(routeKey);
    if (!mapping) {
      return next.handle();
    }

    // Extraer el usuario autenticado del request (agregado por JWT guard)
    const actorId = request.user?.id;

    // Extraer el ID de la entidad de los parámetros
    const entityId = this.extractEntityId(request, mapping.entity);

    return next.handle().pipe(
      tap({
        next: () => {
          // Solo registrar si la respuesta fue exitosa (2xx)
          if (response.statusCode >= 200 && response.statusCode < 300) {
            this.auditService.log({
              actorId,
              entity: mapping.entity,
              entityId,
              action: mapping.action,
              details: {
                method,
                path,
                statusCode: response.statusCode,
                ip: request.ip,
              },
            });
          }
        },
        error: () => {
          // No registrar errores en auditoría para no saturar
        },
      }),
    );
  }

  /**
   * Normaliza la ruta eliminando los IDs de parámetros.
   * Ejemplo: /businesses/abc-123 → /businesses
   */
  private normalizePath(path: string): string {
    // Eliminar IDs de UUID y parámetros
    return path
      .replace(/[a-f0-9-]{36}/g, ':id')
      .replace(/\?.*$/, ''); // Eliminar query params
  }

  /**
   * Busca la configuración de auditoría para una ruta.
   */
  private findMapping(routeKey: string) {
    // Búsqueda exacta primero
    if (ROUTE_MAP[routeKey]) {
      return ROUTE_MAP[routeKey];
    }

    // Búsqueda parcial (para rutas con parámetros)
    for (const [key, value] of Object.entries(ROUTE_MAP)) {
      const pathPart = key.split(' ')[1];
      if (pathPart && routeKey.includes(pathPart)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extrae el ID de la entidad de los parámetros del request.
   */
  private extractEntityId(request: any, entity: string): string | undefined {
    if (request.params?.id) {
      return request.params.id;
    }
    if (request.params?.pageId) {
      return request.params.pageId;
    }
    if (request.body?.id) {
      return request.body.id;
    }
    return undefined;
  }
}
