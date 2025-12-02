import {
  IsInt,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  walletId: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
