import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';
import {
  OverallSummaryDto,
  PeriodAnalyticsDto,
  QueryDto,
  WalletSummaryDto,
} from './dto/analytics.dto';
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
      await this.analyticsRepository.sumIncomeAndExpense(userId, { walletId });

    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) throw new NotFoundException(`Wallet ${walletId} not found`);

    const initial_balance = Number(wallet.initial_balance);

    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(userId, {
        walletId,
      });

    return AnalyticsMapper.toWalletAnalytics(
      walletId,
      income,
      expense,
      initial_balance,
      transactions,
    );
  }

  /* Date range analytics */

  /*custom range analytics helper */
  async customRangeAnalytics(
    userId: number,
    start?: Date,
    end?: Date,
    walletId?: number,
  ): Promise<PeriodAnalyticsDto> {
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(userId, {
        startDate: start,
        endDate: end,
      });
    const transactions =
      await this.analyticsRepository.getTransactionsByDateRange(userId, {
        startDate: start,
        endDate: end,
      });
    return AnalyticsMapper.toPeriodAnalytics(income, expense, transactions);
  }

  //daily analytics
  async dailyAnalytics(userId: number): Promise<any> {
    const { start, end } = DateRange.fromPreset('today');
    return this.customRangeAnalytics(userId, start, end);
  }

  //weekly analytics
  async weeklyAnalytics(userId: number): Promise<any> {
    const { start, end } = DateRange.fromPreset('week');
    return this.customRangeAnalytics(userId, start, end);
  }

  //monthly analytics
  async monthlyAnalytics(userid: number): Promise<any> {
    const { start, end } = DateRange.fromPreset('month');
    return this.customRangeAnalytics(userid, start, end);
  }

  //custom date range analytics
  async customDateRangeAnalytics(userId: number, dto: QueryDto): Promise<any> {
    const { start, end } = DateRange.normalizeDates(dto);
    return this.customRangeAnalytics(userId, start, end);
  }

  /* category analytics */
  async categoryBreakdown(userId: number, dto: QueryDto): Promise<any> {
    const { start, end } = DateRange.normalizeDates(dto);
    const walletId = dto.walletId;
    const breakdown = await this.analyticsRepository.sumByCategory(userId, {
      walletId,
      startDate: start,
      endDate: end,
    });
    return breakdown.map((b) =>
      AnalyticsMapper.toCategoryBreakdown(
        b.categoryId,
        b.name,
        b.type,
        b.total,
        b.count,
      ),
    );
  }
}

/* */
