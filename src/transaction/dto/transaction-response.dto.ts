import { Expose } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class TransactionResponseDto {
  @Expose()
  id: number;

  @Expose()
  walletId: number;

  @Expose()
  categoryId: number;

  @Expose()
  amount: number;

  @Expose()
  type: TransactionType;

  @Expose()
  date: Date;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
