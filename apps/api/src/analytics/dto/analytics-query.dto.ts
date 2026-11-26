import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const DEFAULT_ANALYTICS_RANGE_DAYS = 30;
export const MAX_ANALYTICS_RANGE_DAYS = 365;

export class AnalyticsQueryDto {
  @IsString()
  pageId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ANALYTICS_RANGE_DAYS)
  rangeDays = DEFAULT_ANALYTICS_RANGE_DAYS;
}
