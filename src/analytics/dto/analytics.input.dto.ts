import { IsOptional, IsDateString } from "class-validator";

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
