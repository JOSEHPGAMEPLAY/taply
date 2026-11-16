import { IsEnum } from 'class-validator';

/**
 * DTO para cambiar el estado de un usuario.
 */
export class UpdateStatusDto {
  @IsEnum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED'])
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}
