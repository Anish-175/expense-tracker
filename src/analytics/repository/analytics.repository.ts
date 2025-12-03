import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Repository } from 'typeorm';
import { DateRange } from '../utils/date-helpers';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}



  
  /* sum of income and expenses */
  async sumIncomeAndExpense(
    userId: number,
    walletId?: number,
    startDate?: Date,
    endDate?: Date,
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

    const result = await qb.getRawOne();

    //convert to number
    return {
      income: Number(result?.income) || 0,
      expense: Number(result?.expense) || 0,
    };
  }





  /* current Net balance(initial_balance + income - expense) for user */
  async currentNetBalance(userId: number): Promise<number> {
    const { totalInitialBalance = 0 } = await this.walletRepository
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.initial_balance), 0)', 'totalInitialBalance')
      .where('w.userId = :userId', { userId })
      .getRawOne();

    const { income = 0, expense = 0 } = await this.sumIncomeAndExpense(userId);

    return Number(totalInitialBalance) + Number(income) - Number(expense);
  }
}
