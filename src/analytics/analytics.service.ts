import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    private analyticsRepository: AnalyticsRepository,
  ) {}

  //total expenses
 

  //total income
  async totalExpense(
    userId: number,)
    : Promise<number> {
    return this.analyticsRepository.totalExpenses(userId);
  }

  /*daily analytics */

  /* weekly analytics */

  /* */
}
