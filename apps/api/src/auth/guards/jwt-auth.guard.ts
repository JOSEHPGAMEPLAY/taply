import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard - Guard que protege las rutas requiriendo autenticación JWT.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo verifica si el usuario está autenticado.
 * - ISP: Implementa solo la interfaz CanActivate.
 *
 * Uso:
 * - @UseGuards(JwtAuthGuard) en un controller protege todos los endpoints
 * - @UseGuards(JwtAuthGuard) en un método protege solo ese endpoint
 *
 * Flujo:
 * 1. Verifica que el header Authorization exista
 * 2. Valida el token JWT usando JwtStrategy
 * 3. Adjunta los datos del usuario a request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Determina si la solicitud actual puede acceder al recurso.
   *
   * @param context - Contexto de ejecución de la solicitud
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
