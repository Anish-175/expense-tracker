import { IsOptional, IsIn, IsDateString } from "class-validator";
import { TransactionSummaryDto } from "src/transaction/dto/transaction-summary.dto";
import { TransactionType } from "src/transaction/entities/transaction.entity";
import { Transaction } from "typeorm";

export class OverallSummaryDto {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export class WalletSummaryDto {
  walletId: number;
  totalExpense: number;
  totalIncome: number;
  initial_balance: number;
  currentBalance: number;
  transactions: TransactionSummaryDto[];
}

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
  period: string; // e.g., '2025-11' or '2025-11-17'
  income: number;
  expense: number;
}

export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
