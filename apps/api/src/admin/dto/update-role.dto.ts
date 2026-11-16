import { IsEnum } from 'class-validator';

/**
 * UpdateRoleDto - Datos de entrada para cambiar el rol de un usuario.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo valida el campo role.
 * - OCP: Extensible para agregar más campos sin modificar este DTO.
 */
export class UpdateRoleDto {
  /**
   * Nuevo rol del usuario.
   */
  @IsEnum(['ADMIN', 'USER'], {
    message: 'El rol debe ser ADMIN o USER',
  })
  role: 'ADMIN' | 'USER';
}
