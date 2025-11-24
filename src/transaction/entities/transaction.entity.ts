import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
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
@Index('idx_date', ['Date'])
@Index('idx_user_id', ['userId'])
@Index('idx_wallet_id', ['walletId'])
@Index('idx_category_id', ['categoryId'])
export class Transaction {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @Column()
  @Expose()
  userId: number;

  @ManyToOne(() => Wallet, { nullable: false, onDelete: 'RESTRICT' })
  @Exclude()
  wallet: Wallet;

  @Column()
  @Expose()
  walletId: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @Exclude()
  category?: Category;

  @Column({ nullable: true })
  @Expose()
  categoryId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  @Expose()
  amount: number;

  @Column({ type: 'enum', enum: TransactionType, nullable: false })
  @Expose()
  type: TransactionType;

  @Column({ type: 'timestamptz', nullable: false })
  @Expose()
  Date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  @Exclude()
  deleted_at?: Date;
  // Add analytics fields (year, month, tags, etc.) here later as needed
}
