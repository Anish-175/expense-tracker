import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}
@Index('IDX_category_name_user_id', ['name', 'userId'], { unique: true })
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @Column({ type: 'varchar', length: 7 })
  color: string;

  @Column({name : 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn({name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({name: 'deleted_at', type: 'timestamptz' })
  deletedAt?: Date;

  @OneToMany(() => Transaction, (t) => t.category)
  transactions: Transaction[];
}
