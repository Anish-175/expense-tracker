import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';
import { SummaryDto } from './dto/analytics.dto';

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
  async overallSummary(
    userId: number,
  ): Promise<SummaryDto> {
    const totalIncome = await this.analyticsRepository.sumByTypeAndDateRange(userId, TransactionType.INCOME);
    const totalExpense = await this.analyticsRepository.sumByTypeAndDateRange(userId, TransactionType.EXPENSE);
    const netBalance = await this.analyticsRepository.currentNetBalance(userId);
    return {
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      net: netBalance
    }
  }

  /*daily analytics */

  /* weekly analytics */

  /* */
}
