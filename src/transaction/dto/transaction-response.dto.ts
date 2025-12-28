import { Exclude } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class TransactionResponseDto {
  id: number;

  walletId: number;

  categoryId: number;

  amount: number;

  type: TransactionType;

  date: Date;

  description?: string;

  createdAt: Date;

  @Exclude()
  receiptUrl: string;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  userId: number;

  @Exclude()
  deletedAt?: Date;
}
