import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * CreatePageDto - Datos para crear una nueva página digital.
 */
export class CreatePageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
