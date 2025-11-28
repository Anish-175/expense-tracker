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

  // Helper method to sum by type with optional date range
  async sumByType(
    userId: number,
    walletId: number,
    type: TransactionType,
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
      query.andWhere('transaction.Date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }
    const result = await query.getRawOne();
    return parseFloat(result?.total) || 0;
  }


  //total expenses by wallet
  async getTotalExpenses(userId: number, walletId: number): Promise<number> {
    return await this.sumByType(userId, walletId, TransactionType.EXPENSE);
  }

  //total income by wallet
  async getTotalIncome(userId: number, walletId: number): Promise<number> {
    return await this.sumByType(userId, walletId, TransactionType.INCOME);
  }


  
  // Calculate total expenses for a user in a specific wallet
  // async getTotalExpenses(userId: number, walletId: number): Promise<number> {
  //   const result = await this.transactionRepo
  //     .createQueryBuilder('transaction')
  //     .select('SUM(transaction.amount)', 'total')
  //     .where('transaction.userId = :userId', { userId })
  //     .andWhere('transaction.walletId = :walletId', { walletId })
  //     .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
  //     .getRawOne();
  //   return parseFloat(result?.total) || 0;
  // }

  // Calculate total income for a user in a specific wallet
  // async getTotalIncome(userId: number, walletId: number): Promise<number> {
  //   const result = await this.transactionRepo
  //     .createQueryBuilder('transaction')
  //     .select('SUM(transaction.amount)', 'total')
  //     .where('transaction.userId = :userId', { userId })
  //     .andWhere('transaction.walletId = :walletId', { walletId })
  //     .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
  //     .getRawOne();
  //   return parseFloat(result?.total) || 0;
  // }

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

    const initialBalance = Number(wallet.balance) || 0;
    return initialBalance + (totalIncome - totalExpenses);
  }

  /* Wallet Overview */
  async walletOverview(userId: number): Promise<any> {
    const wallets = await this.walletRepo.find({
      where: { user: { id: userId } },
      select: ['id', 'name', 'balance'],
    });

    const overview = await Promise.all(
      wallets.map(async (wallet) => {
        const totalIncome = await this.getTotalIncome(userId, wallet.id);
        const totalExpenses = await this.getTotalExpenses(userId, wallet.id);
        const netBalance = await this.getRemainingBalance(userId, wallet.id);

        return {
          id: wallet.id,
          name: wallet.name,
          initialBalance: wallet.balance,
          totalIncome: totalIncome,
          totalExpenses: totalExpenses,
          currentBalance: netBalance,
        };
      }),
    );
    return overview;
  }

  /* Overall analytics [total balance across all wallets] */
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

  async getMonthlyOverview(userId: number): Promise<any> {
    const { start, end } = DateRange.thisMonth();

    //income this month
    const income = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const monthlyIncome = parseFloat(income?.total) || 0;

    //expenses this month
    const expenses = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const monthlyExpenses = parseFloat(expenses?.total) || 0;

    //net balance this month
    const netBalance = monthlyIncome - monthlyExpenses;

    //monthly transactions
    const transactions = await this.transactionRepo.find({
      where: {
        userId: userId,
        Date: Between(start, end),
      },
      order: { Date: 'DESC' },
    });

    return {
      date: start.toISOString().split('T')[0],
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      netBalance: netBalance,
      transactions: transactions,
    };
  }

  /* daily analytics */
  async getDailyOverview(userId: number): Promise<any> {
    const { start, end } = DateRange.today();
    const expensesResult = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const dailyExpenses = parseFloat(expensesResult?.total) || 0;

    const incomeResult = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const dailyIncome = parseFloat(incomeResult?.total) || 0;

    const netBalance = dailyIncome - dailyExpenses;

    const transactions = await this.transactionRepo.find({
      where: {
        userId: userId,
        Date: Between(start, end),
      },
      order: { Date: 'DESC' },
    });

    return {
      date: start.toISOString().split('T')[0],
      dailyIncome: dailyIncome,
      dailyExpenses: dailyExpenses,
      netBalance: netBalance,
      transactions: transactions,
    };
  }

  //weekly overview
  async getWeeklyOverview(userId: number): Promise<any> {
    const { start, end } = DateRange.thisWeek();

    //expenses this week
    const expensesResult = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const weeklyExpenses = parseFloat(expensesResult?.total) || 0;

    //income this week
    const incomeResult = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: start,
        end: end,
      })
      .getRawOne();
    const weeklyIncome = parseFloat(incomeResult?.total) || 0;

    //net balance this week
    const netBalance = weeklyIncome - weeklyExpenses;

    //weekly transactions
    const transactions = await this.transactionRepo.find({
      where: {
        userId: userId,
        Date: Between(start, end),
      },
      order: { Date: 'DESC' },
    });
    return {
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      weeklyIncome: weeklyIncome,
      weeklyExpenses: weeklyExpenses,
      netBalance: netBalance,
      transactions: transactions,
    };
  }










  // async getRemainingBalance(
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
