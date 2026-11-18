import { IsString, MaxLength, IsOptional, IsObject } from 'class-validator';

/**
 * UpdateTemplateDto - Datos de entrada para actualizar un template.
 *
 * Validaciones:
 * - Todos los campos son opcionales (actualización parcial)
 * - Nombre entre 2 y 100 caracteres si se proporciona
 * - Descripción opcional hasta 500 caracteres
 */
export class UpdateTemplateDto {
  /**
   * Nuevo nombre del template.
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  /**
   * Nueva descripción del template.
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  /**
   * Nueva configuración JSON del template.
   */
  @IsOptional()
  @IsObject({ message: 'La configuración debe ser un objeto JSON' })
  config?: Record<string, any>;

  /**
   * Nueva versión del template.
   */
  @IsOptional()
  @IsString({ message: 'La versión debe ser un texto' })
  @MaxLength(20, { message: 'La versión no puede exceder 20 caracteres' })
  version?: string;
}
