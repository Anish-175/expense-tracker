import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';
import { DateRangeQueryDto, OverallSummaryDto, WalletSummaryDto } from './dto/analytics.dto';
import { AnalyticsMapper } from './mapper/analytics.mapper';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  /* Overall summary*/
  async overallSummary(userId: number): Promise<OverallSummaryDto> {
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(userId);
    const currentBalance =
      await this.analyticsRepository.currentNetBalance(userId);
    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: currentBalance,
    };
  }

  /*wallet summary */
  async walletSummary(
    userId: number,
    walletId: number,
  ): Promise<WalletSummaryDto> {
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(userId, walletId);

    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) throw new NotFoundException(`Wallet ${walletId} not found`);

    const initial_balance = Number(wallet.initial_balance);

    const transactions = await this.transactionRepository.find({
      where: { wallet: { id: walletId }, user: { id: userId } },
      order: { date: 'DESC' },
    });

    return AnalyticsMapper.toWalletAnalytics(
      walletId,
      income,
      expense,
      initial_balance,
      transactions,
    );
  }

  /*daily analytics */
  async dailyAnalytics(userId: number): Promise<any> {
    const { start, end } = DateRange.today();
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(
        userId,
        undefined,
        start,
        end,
      );
    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(
        userId,
        start,
        end,
      );
    return AnalyticsMapper.toPeriodAnalytics(income, expense, transactions);
  }

  /* weekly analytics */
  async weeklyAnalytics(userId: number): Promise<any> {
    const { start, end } = DateRange.thisWeek();
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(
        userId,
        undefined,
        start,
        end,
      );
    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(
        userId,
        start,
        end,
      );
    return AnalyticsMapper.toPeriodAnalytics(income, expense, transactions);
  }

  /* monthly analytics */
  async monthlyAnalytics(userid: number): Promise<any> {
    const { start, end } = DateRange.thisMonth();

    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(
        userid,
        undefined,
        start,
        end,
      );
    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(
        userid,
        start,
        end,
      );
    return AnalyticsMapper.toPeriodAnalytics(income, expense, transactions);
  }

  async customDateRangeAnalytics(
    userId: number,
    dto: DateRangeQueryDto
  ): Promise<any> {
    const { start, end } = DateRange.normalizeDates(dto);
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(
        userId,
        undefined,
        start,
        end,
      );  
    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(
        userId,
        start,
        end,
      );
    return AnalyticsMapper.toPeriodAnalytics(income, expense, transactions);
  }
}

/* */
