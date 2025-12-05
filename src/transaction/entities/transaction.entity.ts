import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Category } from 'src/category/entities/category.entity';
import { Exclude, Expose } from 'class-transformer';

export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer',
}

@Entity('transactions')
@Index('idx_date', ['date'])
@Index('idx_user_id', ['userId'])
@Index('idx_wallet_id', ['walletId'])
@Index('idx_category_id', ['categoryId'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Wallet, { nullable: false, onDelete: 'RESTRICT' })
  wallet: Wallet;

  @Column()
  walletId: number;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category;

  @Column({ nullable: true })
  categoryId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType, nullable: false })
  type: TransactionType;

  @Column({ type: 'timestamptz', nullable: false })
  date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date;
  // Add analytics fields (year, month, tags, etc.) here later as needed
}
