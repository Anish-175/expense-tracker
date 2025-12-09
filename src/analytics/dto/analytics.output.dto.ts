import { IsOptional, IsDateString } from 'class-validator';
import { CategoryType } from 'src/category/entities/category.entity';
import { TransactionSummaryDto } from 'src/transaction/dto/transaction-summary.dto';

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
  walletName: string
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
  type: CategoryType;
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




