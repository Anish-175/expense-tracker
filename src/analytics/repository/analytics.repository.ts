import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TransactionType } from "src/transaction/entities/transaction.entity";
import { Wallet } from "src/wallet/entities/wallet.entity";
import {  Repository } from "typeorm";

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}
  async sumByTypeAndDateRange(
    userId: number,
    type: TransactionType,
    walletId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type });

    // wallet filter (use !== undefined to allow walletId = 0)
    if (walletId !== undefined) {
      query.andWhere('t.walletId = :walletId', { walletId });
    }

    // date filters (handle all combinations)
    if (startDate && endDate) {
      query.andWhere('t.date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    } else if (startDate) {
      query.andWhere('t.date >= :start', { start: startDate });
    } else if (endDate) {
      query.andWhere('t.date <= :end', { end: endDate });
    }

    const result = await query.getRawOne();
    return parseFloat(result?.total) || 0;
  }

  async totalExpenses(
    userId: number): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }
}