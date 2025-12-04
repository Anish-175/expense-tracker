import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionMapper } from 'src/transaction/mappers/transaction.mapper';
import { PeriodAnalyticsDto, WalletSummaryDto } from '../dto/analytics.dto';

export class AnalyticsMapper {
  static toPeriodAnalytics(
    income: number,
    expense: number,
    transactions: Transaction[],
  ): PeriodAnalyticsDto {
    return {
      income,
      expense,
      profit: income - expense,
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
}
