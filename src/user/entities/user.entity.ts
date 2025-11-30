import { Exclude, Expose } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() // changed from 'uuid'
  id: number; // changed from string

  @Column({ type: 'varchar', length: 255 }) //user name
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true }) //email
  email: string;

  @Column({ type: 'varchar', length: 255 }) //password hashed
  password: string;

  @CreateDateColumn({ type: 'timestamptz' }) //timestamp with timezones auto
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) //for soft deletes
  deleted_at?: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}

// user.entity.ts
