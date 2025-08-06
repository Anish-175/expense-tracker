import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}
@Index('IDX_category_name_user_id', ['name', 'user'], { unique: true })
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Exclude()
  user?: User;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'enum', enum: CategoryType })
  @Expose()
  type: CategoryType;

  @Column({ type: 'varchar', length: 7 })
  @Expose()
  color: string;

  @Column({ type: 'boolean', default: false })
  @Expose()
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  @Exclude()
  deleted_at?: Date;
}
