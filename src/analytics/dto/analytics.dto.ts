import { TransactionType } from "src/transaction/entities/transaction.entity";

export class OverallSummaryDto {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export class WalletSummaryDto {
  walletId: number;
  totalExpense: number;
  totalIncome: number;
  initial_balance: number;
  currentBalance: number;
  transactions: {
    id: number;
    type: TransactionType
    amount: number;
    date: Date;
    description?: string;
  }[];
}

export class CategoryBreakdownDto {
  categoryId: number;
  categoryName: string;
  total: number;
}

export class TrendPointDto {
  period: string; // e.g., '2025-11' or '2025-11-17'
  income: number;
  expense: number;
}
