import { IsOptional, IsDateString } from 'class-validator';
import { CategoryType } from 'src/category/entities/category.entity';
import { TransactionSummaryDto } from 'src/transaction/dto/transaction-summary.dto';

//output dto for overall analytics responses
export class OverallSummaryDto {
  totalIncome: number;
  totalExpense: number;
  initialBalance: number;
  currentNetBalance: number;
}

//output dto for wallet analytics responses
export class WalletSummaryDto {
  walletId: number;
  totalExpense: number;
  totalIncome: number;
  initial_balance: number;
  currentBalance: number;
  transactions: TransactionSummaryDto[];
}

export class walletsOverviewDto {
  walletId: number;
  walletName: string
  initialBalance: number;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

//output dto for period analytics responses(daily, weekly, monthly, custom)
export class PeriodAnalyticsDto {
  periodStart?: Date;
  periodEnd?: Date;
  income: number;
  expense: number;
  netProfit: number;
  transactionsCount: number;
  transactions: TransactionSummaryDto[];
}

export class CategoryBreakdownDto {
  categoryId: number;
  categoryName: string;
  type: CategoryType;
  total: number;
  count: number;
}

export class TrendPointDto {
  period: string;
  income: number;
  expense: number;
  netProfit: number;
}


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


