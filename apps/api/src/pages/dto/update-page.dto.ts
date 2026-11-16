import { IsString, MinLength, MaxLength, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ButtonDto - Datos de un botón de página.
 */
export class ButtonDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  @MinLength(1)
  label: string;

  @IsString()
  @MinLength(1)
  url: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ButtonDto)
  buttons?: ButtonDto[];
}
