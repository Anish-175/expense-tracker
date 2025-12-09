import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionMapper } from 'src/transaction/mappers/transaction.mapper';
import {
  CategoryBreakdownDto,
  PeriodAnalyticsDto,
  TrendPointDto,
  WalletSummaryDto,
} from '../dto/analytics.dto';
export class AnalyticsMapper {
  static toPeriodAnalytics(
    income: number,
    expense: number,
    transactions: Transaction[],
    start?: Date,
    end?: Date,
  ): PeriodAnalyticsDto {
    return {
      periodStart: start,
      periodEnd: end,
      income: income,
      expense: expense,
      netProfit: income - expense,
      transactionsCount: transactions.length,
      transactions: transactions.map(TransactionMapper.toDto),
    };
  }

  static toWalletAnalytics(
    walletId: number,
    income: number,
    expense: number,
    initial_balance: number,
    transactions: Transaction[],
  ): WalletSummaryDto {
    return {
      walletId: walletId,
      totalIncome: income,
      totalExpense: expense,
      initial_balance: initial_balance,
      currentBalance: initial_balance + income - expense,
      transactions: transactions.map(TransactionMapper.toDto),
    };
  }

  static toCategoryBreakdown(raw: any): CategoryBreakdownDto {
    return {
      categoryId: Number(raw.categoryId),
      categoryName: raw.categoryName,
      type: raw.categoryType,
      total: Number(raw.total),
      count: Number(raw.count),
    };
  }

  static toTrendData(raw: any): TrendPointDto {
    return {
      period: raw.period,
      income: Number(raw.income),
      expense: Number(raw.expense),
      netProfit: Number(raw.income) - Number(raw.expense),
    };
  }
}
