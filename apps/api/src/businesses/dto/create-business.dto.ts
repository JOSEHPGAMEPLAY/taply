import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * CreateBusinessDto - Datos de entrada para crear un nuevo negocio.
 *
 * Validaciones:
 * - Nombre requerido entre 2 y 100 caracteres
 * - Slug generado automáticamente a partir del nombre
 * - Descripción opcional
 */
export class CreateBusinessDto {
  /**
   * Nombre del negocio (2-100 caracteres).
   */
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  /**
   * Descripción opcional del negocio.
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;
}
