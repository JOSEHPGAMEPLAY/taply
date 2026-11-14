import { IsString, IsOptional } from 'class-validator';
export class AnalyticsQueryDto {
  @IsString()
  pageId: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
