import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

/**
 * CreateProductDto - Datos para crear un producto de facturación.
 */
export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string; // ONE_TIME or SUBSCRIPTION

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  interval?: string;
}
