export class TransactionSummaryDto {
    id: number;
    type: string;
    amount: number
    date: Date;
    description?: string;
}