import { IsString, MaxLength, IsOptional, IsObject } from 'class-validator';

/**
 * CreateTemplateDto - Datos de entrada para crear un nuevo template.
 *
 * Validaciones:
 * - Nombre requerido entre 2 y 100 caracteres
 * - Descripción opcional
 * - Config opcional (JSON)
 * - Versión opcional, default "1.0.0"
 */
export class CreateTemplateDto {
  /**
   * Nombre del template (2-100 caracteres).
   */
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  /**
   * Descripción opcional del template.
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  /**
   * Configuración JSON del template (botones, colores, etc.).
   */
  @IsOptional()
  @IsObject({ message: 'La configuración debe ser un objeto JSON' })
  config?: Record<string, any>;

  /**
   * Versión del template.
   */
  @IsOptional()
  @IsString({ message: 'La versión debe ser un texto' })
  @MaxLength(20, { message: 'La versión no puede exceder 20 caracteres' })
  version?: string;
}
