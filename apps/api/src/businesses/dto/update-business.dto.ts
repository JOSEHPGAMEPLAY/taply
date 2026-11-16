import { IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

/**
 * UpdateBusinessDto - Datos de entrada para actualizar un negocio.
 *
 * Validaciones:
 * - Todos los campos son opcionales (actualización parcial)
 * - Nombre entre 2 y 100 caracteres si se proporciona
 * - Descripción opcional hasta 500 caracteres
 */
export class UpdateBusinessDto {
  /**
   * Nuevo nombre del negocio (2-100 caracteres).
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  /**
   * Nueva descripción del negocio.
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  /**
   * Nuevo estado del negocio.
   */
  @IsOptional()
  @IsEnum(['PROSPECT', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'CLOSED'], {
    message: 'El estado debe ser PROSPECT, ACTIVE, PAUSED, SUSPENDED o CLOSED',
  })
  status?: string;
}
