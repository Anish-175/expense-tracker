import { IsOptional, IsIn, IsDateString } from "class-validator";
import { TransactionSummaryDto } from "src/transaction/dto/transaction-summary.dto";

//output dto for overall analytics responses
export class OverallSummaryDto {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
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

//output dto for period analytics responses(daily, weekly, monthly, custom)
export class PeriodAnalyticsDto {
  income: number;
  expense: number;
  profit: number;
  transactions: TransactionSummaryDto[];
}


export class CategoryBreakdownDto {
  categoryId: number;
  categoryName: string;
  total: number;
}

export class TrendPointDto {
  period: string; 
  income: number;
  expense: number;
}

//input dto for date range queries
export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
