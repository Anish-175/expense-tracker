import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Repository } from 'typeorm';
import { DateRange } from '../utils/date-helpers';
import { AnalyticsFilters } from '../dto/analytics.dto';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  //helper method to validate wallet and date filters
  private applyWalletAndDateFilters(
    qb: any,
    walletId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    //for wallet specific transactions
    if (walletId !== undefined)
      qb.andWhere('t.walletId = :walletId', { walletId });

    //for date range
    if (startDate && endDate) {
      qb.andWhere('t.date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    } else if (startDate) {
      qb.andWhere('t.date >= :start', { start: startDate });
    } else if (endDate) {
      qb.andWhere('t.date <= :end', { end: endDate });
    }
    //exclude soft deleted
    qb.andWhere('t.deleted_at IS NULL');
  }

  /*fetch a wallet */
  async fetchWalletById(walletId: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) throw new NotFoundException(`Wallet ${walletId} not found`);
    return wallet;
  }

  /* sum of income and expenses */
  async sumIncomeAndExpense(
    userId: number,
    filters: AnalyticsFilters = {},
  ): Promise<any> {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .select(
        `
      COALESCE(SUM(CASE WHEN t.type = :income THEN t.amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN t.type = :expense THEN t.amount END), 0) AS expense
    `,
      )
      .where('t.userId = :userId', { userId })
      .setParameters({
        income: TransactionType.INCOME,
        expense: TransactionType.EXPENSE,
      });

    // wallet and Date range filters
    this.applyWalletAndDateFilters(
      qb,
      filters.walletId,
      filters.startDate,
      filters.endDate,
    );

    const result = await qb.getRawOne();

    //convert to number
    return {
      income: Number(result?.income) || 0,
      expense: Number(result?.expense) || 0,
    };
  }

  /* current Net balance(initial_balance + income - expense) for user */
  async totalInitialBalance(
    userId: number,
    walletId?: number,
  ): Promise<number> {
    const qb = await this.walletRepository
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.initial_balance), 0)', 'totalInitialBalance')
      .where('w.userId = :userId', { userId });

    if (walletId !== undefined) {
      //filter by walletId if provided
      qb.andWhere('w.id = :walletId', { walletId });
    }

    const totalInitialBalance = qb.getRawOne();
    return Number(totalInitialBalance) || 0;
  }

  /* get transactions by a date range */
  async getTransactionsByDateRange(
    userId: number,
    filters: AnalyticsFilters = {},
  ): Promise<Transaction[]> {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId });

    // wallet and Date range filters
    this.applyWalletAndDateFilters(
      qb,
      filters.walletId,
      filters.startDate,
      filters.endDate,
    );

    qb.orderBy('t.date', 'DESC');
    qb.take(10);

    return qb.getMany();
  }

  /* sum by category */
  async sumByCategory(userId: number, filters: AnalyticsFilters = {}) {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('c.type', 'categoryType')
      .addSelect('SUM(t.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId });

    // wallet and Date range filters
    this.applyWalletAndDateFilters(
      qb,
      filters.walletId,
      filters.startDate,
      filters.endDate,
    );

    qb.groupBy('c.id, c.type, c.name');

    const result = await qb.getRawMany();

    return result;
  }

  /* trend data by period */
  async trendByPeriod(
    userId: number,
    period: 'daily' | 'weekly' | 'monthly',
    count: number,
  ) {
    let groupByExpr: string;
    let intervalExpr: string;

    switch (period) {
      case 'daily':
        groupByExpr = `DATE_TRUNC('day', t.date)`;
        intervalExpr = `:count * INTERVAL '1 day'`;
        break;
      case 'weekly':
        groupByExpr = `DATE_TRUNC('week', t.date)`;
        intervalExpr = `:count * INTERVAL '1 week'`;
        break;
      case 'monthly':
        groupByExpr = `DATE_TRUNC('month', t.date)`;
        intervalExpr = `:count * INTERVAL '1 month'`;
        break;
      default:
        throw new Error('Invalid period');
    }

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .select(`${groupByExpr}`, 'period')
      .addSelect(
        `COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0)`,
        'income',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0)`,
        'expense',
      )
      .where('t.userId = :userId', { userId })
      .andWhere(`t.date >= NOW() - (${intervalExpr})`, { count })
      .andWhere('t.deleted_at IS NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    return qb.getRawMany();
  }
}
