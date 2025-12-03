import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';
import { SummaryDto, walletSummaryDto } from './dto/analytics.dto';

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
  async overallSummary(userId: number): Promise<SummaryDto> {
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

  async walletSummary(
    userId: number,
    walletId: number,
  ): Promise<walletSummaryDto> {
    const { income, expense } =
      await this.analyticsRepository.sumIncomeAndExpense(userId, walletId);
    const currentBalance = await this.analyticsRepository.currentNetBalance(
      userId,
      walletId,
    );
    return {
      walletId:walletId,
      totalIncome: income,
      totalExpense: expense,
      currentBalance: currentBalance
    }
  }

  /*daily analytics */

  /* weekly analytics */

  /* */
}
