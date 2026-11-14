import { IsString } from 'class-validator';

/**
 * RefreshTokenDto - Datos de entrada para refrescar el token de acceso.
 *
 * Validaciones:
 * - Token de refresco requerido
 */
export class RefreshTokenDto {
  /**
   * Token de refresco válido no expirado.
   */
  @IsString({ message: 'El token de refresco debe ser un texto' })
  refreshToken: string;
}
