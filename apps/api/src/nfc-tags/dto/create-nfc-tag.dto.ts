import { IsString, IsOptional } from 'class-validator';
export class CreateNfcTagDto {
  @IsOptional()
  @IsString()
  token?: string;
}
