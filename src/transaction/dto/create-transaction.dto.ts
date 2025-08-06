import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {

  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  Date: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
