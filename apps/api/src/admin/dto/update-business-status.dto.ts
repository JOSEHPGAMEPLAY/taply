import { IsEnum } from 'class-validator';

/**
 * DTO para cambiar el estado de un negocio.
 */
export class UpdateBusinessStatusDto {
  @IsEnum(['PROSPECT', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'CLOSED'])
  status: 'PROSPECT' | 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'CLOSED';
}
