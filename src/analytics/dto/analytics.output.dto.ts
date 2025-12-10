import { IsOptional, IsDateString } from 'class-validator';
import { CategoryType } from 'src/category/entities/category.entity';
import { TransactionSummaryDto } from 'src/transaction/dto/transaction-summary.dto';
import { TransactionType } from 'src/transaction/entities/transaction.entity';

// overall summary dto
export class OverallSummaryDto {
  totalIncome: number;
  totalExpense: number;
  initialBalance: number;
  currentNetBalance: number;
}

//wallet summary dto
export class WalletSummaryDto {
  walletId: number;
  totalExpense: number;
  totalIncome: number;
  initial_balance: number;
  currentBalance: number;
  transactions: TransactionSummaryDto[];
}

//wallets overview dto
export class walletsOverviewDto {
  walletId: number;
  walletName: string;
  initialBalance: number;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

//Period analytics responses(daily, weekly, monthly, custom)
export class PeriodAnalyticsDto {
  periodStart?: Date;
  periodEnd?: Date;
  income: number;
  expense: number;
  netProfit: number;
  transactionsCount: number;
  transactions: TransactionSummaryDto[];
}

//category breakdown dto
export class CategoryBreakdownDto {
  categoryId: number;
  categoryName: string;
  categoryType: CategoryType;
  transactionType: TransactionType;
  total: number;
  count: number;
}

//trend point dto
export class TrendPointDto {
  period: string;
  income: number;
  expense: number;
  netProfit: number;
}

export class ComparePeriodDto {
  currentIncome: number;
  previousIncome: number;
  incomeChange: number;
  incomeChangePercent: number;

  currentExpense: number;
  previousExpense: number;
  expenseChange: number;
  expenseChangePercent: number;
}
