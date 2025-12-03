import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';
import { AnalyticsRepository } from './repository/analytics.repository';
import { OverallSummaryDto, WalletSummaryDto } from './dto/analytics.dto';

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

    return {
      walletId: walletId,
      totalIncome: income,
      totalExpense: expense,
      initial_balance: initial_balance,
      currentBalance: initial_balance + income - expense,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        date: tx.date,
        description: tx.description,
      })),
    };

    /*daily analytics */

    /* weekly analytics */

    /* */
  }
}
