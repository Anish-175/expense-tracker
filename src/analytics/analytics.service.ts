import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  // Helper: Get current user from auth (we'll pass userId from controller)
  async getTotalExpenses(userId: number, walletId: number): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.walletId = :walletId', { walletId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  async getTotalIncome(userId: number, walletId: number): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.walletId = :walletId', { walletId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  //   async getExpensesThisMonth(userId: number): Promise<number> {
  //     const now = new Date();
  //     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  //     const result = await this.transactionRepo
  //       .createQueryBuilder('transaction')
  //       .select('SUM(transaction.amount)', 'total')
  //       .where('transaction.userId = :userId', { userId })
  //       .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
  //       .andWhere('transaction.Date BETWEEN :start AND :end', {
  //         start: firstDay,
  //         end: lastDay,
  //       })
  //       .getRawOne();
  //     return parseFloat(result?.total) || 0;
  //   }

  //   async getRemainingBalance(
  //     userId: number,
  //     walletId?: number,
  //   ): Promise<number> {
  //     if (walletId) {
  //       // For specific wallet
  //       const wallet = await this.walletRepo.findOne({
  //         where: { id: walletId, user: { id: userId } },
  //       });
  //       return wallet?.balance || 0;
  //     } else {
  //       // Total across all wallets
  //       const result = await this.walletRepo
  //         .createQueryBuilder('wallet')
  //         .select('SUM(wallet.balance)', 'total')
  //         .where('wallet.user.id = :userId', { userId }) // Assuming user relation
  //         .getRawOne();
  //       return parseFloat(result?.total) || 0;
  //     }
  //   }

  //   async getProjectedBalance(
  //     userId: number,
  //     monthsAhead: number = 1,
  //   ): Promise<number> {
  //     // Simple: Current total balance + (avg monthly income - avg monthly expenses) * months
  //     const now = new Date();
  //     const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //     const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  //     // Avg monthly expense (from last month, for simplicity)
  //     const avgExpenseResult = await this.transactionRepo
  //       .createQueryBuilder('transaction')
  //       .select('SUM(transaction.amount)', 'total')
  //       .where('transaction.userId = :userId', { userId })
  //       .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
  //       .andWhere('transaction.Date BETWEEN :start AND :end', {
  //         start: lastMonthStart,
  //         end: lastMonthEnd,
  //       })
  //       .getRawOne();
  //     const avgExpense = parseFloat(avgExpenseResult?.total) || 0;

  //     // Avg monthly income (similar)
  //     const avgIncomeResult = await this.transactionRepo
  //       .createQueryBuilder('transaction')
  //       .select('SUM(transaction.amount)', 'total')
  //       .where('transaction.userId = :userId', { userId })
  //       .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
  //       .andWhere('transaction.Date BETWEEN :start AND :end', {
  //         start: lastMonthStart,
  //         end: lastMonthEnd,
  //       })
  //       .getRawOne();
  //     const avgIncome = parseFloat(avgIncomeResult?.total) || 0;

  //     const currentBalance = await this.getRemainingBalance(userId);
  //     const netMonthly = avgIncome - avgExpense;
  //     return currentBalance + netMonthly * monthsAhead;
  //   }

  //   // Add more methods similarly, e.g., expenses by category
  //   async getExpensesByCategory(
  //     userId: number,
  //   ): Promise<{ categoryId: number; total: number }[]> {
  //     const results = await this.transactionRepo
  //       .createQueryBuilder('transaction')
  //       .select('transaction.categoryId', 'categoryId')
  //       .addSelect('SUM(transaction.amount)', 'total')
  //       .where('transaction.userId = :userId', { userId })
  //       .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
  //       .groupBy('transaction.categoryId')
  //       .getRawMany();
  //     return results.map((r) => ({
  //       categoryId: r.categoryId,
  //       total: parseFloat(r.total) || 0,
  //     }));
  //   }
}
