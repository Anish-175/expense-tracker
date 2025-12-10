import { IsOptional, IsDateString } from "class-validator";
import { from } from "form-data";

//input dto for queries
export class QueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  walletId?: number;
}

//input dto for analytics filters
export interface AnalyticsFilters {
  walletId?: number;
  startDate?: Date;
  endDate?: Date;
}

export class PeriodRangeDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

export class ComparePeriodsRequestDto {
  current: PeriodRangeDto;
  previous: PeriodRangeDto;
}
