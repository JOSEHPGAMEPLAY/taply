import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

/**
 * AdminAuthGuard - Guard que protege las rutas requiriendo rol de administrador.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo verifica si el usuario autenticado es administrador.
 * - ISP: Extiende JwtAuthGuard para reutilizar la validación JWT.
 *
 * Flujo:
 * 1. JwtAuthGuard valida el token JWT y adjunta request.user
 * 2. Este guard verifica que request.user.role === 'ADMIN'
 * 3. Si no es admin, retorna 403 Forbidden
 */
@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  /**
   * Determina si la solicitud actual puede acceder al recurso.
   *
   * @param context - Contexto de ejecución de la solicitud
   * @returns true si el usuario es admin, lanza 403 en caso contrario
   */
  async canActivate(context: ExecutionContext) {
    // Primero validar el JWT
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    // Verificar que el usuario es administrador
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Se requieren permisos de administrador');
    }

    return true;
  }
}
