import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsPeriod {
  DAY = 'day',
  MONTH = 'month',
  WEEK = 'week'
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

    @IsOptional()
    @IsEnum(AnalyticsPeriod)
    period?: AnalyticsPeriod;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 100;
}

export class SummaryDto {
  totalIncome: number; // cents
  totalExpense: number; // cents
  currentBalance: number; // cents
}

export class CategoryBreakdownDto {
  categoryId: number;
  categoryName: string;
  total: number; // cents
}

export class TrendPointDto {
  period: string; // e.g., '2025-11' or '2025-11-17'
  income: number; // cents
  expense: number; // cents
}
