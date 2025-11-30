import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums
import { DateRange } from './utils/date-helpers';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  /* Helper method to sum by type with optional date range */
  async sumByTypeAndDateRange(
    userId: number,
    type: TransactionType,
    walletId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type });
    if (walletId) {
      query.andWhere('transaction.walletId = :walletId', { walletId });
    }
    if (startDate && endDate) {
      query.andWhere('transaction.date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }
    const result = await query.getRawOne();
    return parseFloat(result?.total) || 0;
  }

  /* wallet analytics */

  //total expenses by wallet
  async getTotalExpenses(userId: number, walletId: number): Promise<number> {
    return await this.sumByTypeAndDateRange(
      userId,
      TransactionType.EXPENSE,
      walletId,
    );
  }

  //total income by wallet
  async getTotalIncome(userId: number, walletId: number): Promise<number> {
    return await this.sumByTypeAndDateRange(
      userId,
      TransactionType.INCOME,
      walletId,
    );
  }

  // Calculate net balance (income - expenses) for a user in a specific wallet
  async getRemainingBalance(userId: number, walletId: number): Promise<number> {
    const totalIncome = await this.getTotalIncome(userId, walletId);
    const totalExpenses = await this.getTotalExpenses(userId, walletId);
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId, user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const initialBalance = Number(wallet.initial_balance) || 0;
    return initialBalance + (totalIncome - totalExpenses);
  }

  /* Wallet Overview */
  async walletOverview(userId: number): Promise<any> {
    const wallets = await this.walletRepo.find({
      where: { user: { id: userId } },
      select: ['id', 'name', 'initial_balance'],
    });

    const overview = await Promise.all(
      wallets.map(async (wallet) => {
        const totalIncome = await this.getTotalIncome(userId, wallet.id);
        const totalExpenses = await this.getTotalExpenses(userId, wallet.id);
        const netBalance = await this.getRemainingBalance(userId, wallet.id);

        return {
          id: wallet.id,
          name: wallet.name,
          initialBalance: wallet.initial_balance,
          totalIncome: totalIncome,
          totalExpenses: totalExpenses,
          currentBalance: netBalance,
        };
      }),
    );
    return overview;
  }

  /* Overall analytics [total balance across all wallets] */

  //current overall remaining balance of user
  async getOverallRemainingBalance(userId: number): Promise<number> {
    const wallets = await this.walletRepo.find({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (wallets.length === 0) {
      throw new NotFoundException('No wallets found for user');
    }

    //sum net balances of all wallets
    const balancePromises = wallets.map((wallet) =>
      this.getRemainingBalance(userId, wallet.id),
    );

    const balances = await Promise.all(balancePromises);

    const total = balances.reduce((sum, val) => sum + val, 0);

    return total;
  }

  /* Monthly analytics [expenses, income, transactions, balance] */

  async monthlyIncome(userId: number): Promise<number> {
    const { start, end } = DateRange.thisMonth();
    return this.sumByTypeAndDateRange(
      userId,
      TransactionType.INCOME,
      undefined,
      start,
      end,
    );
  }

  async monthlyExpenses(userId: number): Promise<number> {
    const { start, end } = DateRange.thisMonth();
    return this.sumByTypeAndDateRange(
      userId,
      TransactionType.EXPENSE,
      undefined,
      start,
      end,
    );
  }

  // Monthly overview
  async getMonthlyOverview(userId: number): Promise<any> {
    const { start, end } = DateRange.thisMonth();
    const income = await this.monthlyIncome(userId);
    const expenses = await this.monthlyExpenses(userId);
    const netBalance = income - expenses;

    //Monthly transactions
    const transactions = await this.transactionRepo.find({
      where: {
        userId: userId,
        date: Between(start, end),
      },
      order: { date: 'DESC' },
    });

    return {
      date: start.toISOString().split('T')[0],
      monthlyIncome: income,
      monthlyExpenses: expenses,
      netBalance: netBalance,
      transactions: transactions,
    };
  }

  /*daily analytics */

  /* weekly analytics */

  /* */
}
