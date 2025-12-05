import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionSummaryDto } from '../dto/transaction-summary.dto';
import { Transaction } from '../entities/transaction.entity';

export class TransactionMapper {
  static toDto(tx: Transaction): TransactionSummaryDto {
    return {
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      date: tx.date,
      description: tx.description,
    };
  }
}
