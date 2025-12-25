import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionMapper } from 'src/transaction/mappers/transaction.mapper';
import {
  CategoryBreakdownDto,
  ComparePeriodDto,
  PeriodAnalyticsDto,
  TrendPointDto,
  walletsOverviewDto,
  WalletSummaryDto,
} from '../dto/analytics.output.dto';
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

  static toWalletsOverview(raw: any): walletsOverviewDto {
    return {
      walletId: Number(raw.walletId),
      walletName: raw.walletName,
      initialBalance: Number(raw.initialBalance),
      totalIncome: Number(raw.income),
      totalExpense: Number(raw.expense),
      currentBalance:
        Number(raw.initialBalance) + Number(raw.income) - Number(raw.expense),
    };
  }

  static toCategoryBreakdown(raw: CategoryBreakdownDto): CategoryBreakdownDto {
    return {
      categoryId: Number(raw.categoryId),
      categoryName: raw.categoryName,
      categoryType: raw.categoryType,
      transactionType: raw.transactionType,
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

  static toComparePeriods(
    currentData: PeriodAnalyticsDto,
    previousData: PeriodAnalyticsDto,
  ): ComparePeriodDto {
    return {
      currentIncome: currentData.income,
      previousIncome: previousData.income,
      incomeChange: currentData.income - previousData.income,
      incomeChangePercent: this.percentChange(
        previousData.income,
        currentData.income,
      ),

      currentExpense: currentData.expense,
      previousExpense: previousData.expense,
      expenseChange: currentData.expense - previousData.expense,
      expenseChangePercent: this.percentChange(
        previousData.expense,
        currentData.expense,
      ),
    };
  }

  /*Helpers */

  //percent change helper
  private static percentChange(
    previousValue: number,
    currentValue: number,
  ): number {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : 100;
    }
    return (
      Math.round(
        ((currentValue - previousValue) / Math.abs(previousValue)) * 10000,
      ) / 100
    );
  }
}
