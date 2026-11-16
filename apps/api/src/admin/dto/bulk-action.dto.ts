import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para acciones masivas sobre usuarios.
 */
export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsEnum(['UPDATE_ROLE', 'UPDATE_STATUS', 'REQUEST_PASSWORD_RESET', 'DELETE'])
  action: 'UPDATE_ROLE' | 'UPDATE_STATUS' | 'REQUEST_PASSWORD_RESET' | 'DELETE';

  @IsOptional()
  @IsString()
  value?: string;
}
