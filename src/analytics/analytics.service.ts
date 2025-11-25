import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity'; // Adjust path
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionType } from '../transaction/entities/transaction.entity'; // For enums

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}


  /* Basic calculations for wallet [Expense, Income and remaining balance] */

  // Calculate total expenses for a user in a specific wallet
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

  // Calculate total income for a user in a specific wallet
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


  /* Monthly analytics [expenses, income] */

  //monthly expenses
  async getExpensesThisMonth(userId: number): Promise<number> {
    const now = new Date();
    const firstDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const lastDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: firstDay,
        end: lastDay,
      })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  //monthly income
  async getIncomeThisMonth(userId: number): Promise<number> {
    const now = new Date();
    const firstDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const lastDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.Date BETWEEN :start AND :end', {
        start: firstDay,
        end: lastDay,
      })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  //monthly net balance
  async getNetBalanceThisMonth(userId: number): Promise<number> {
    const totalIncome = await this.getIncomeThisMonth(userId);
    const totalExpenses = await this.getExpensesThisMonth(userId); 
    return totalIncome - totalExpenses;
  }

  //get list of transactions this month
  async getTransactionsThisMonth(userId: number): Promise<Transaction[]> {
    const now = new Date();
    const firstDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const lastDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return this.transactionRepo.find({
      where: {
        userId: userId,
        Date: Between(firstDay, lastDay),
      },
      order: { Date: 'DESC' },
    });
  }

  //

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
