import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * UpdatePageDto - Datos para actualizar una página.
 */
export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
