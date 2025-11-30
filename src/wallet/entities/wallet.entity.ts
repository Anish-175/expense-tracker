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

export enum WalletType {
  WALLET = 'wallet',
  BANK = 'bank',
  CASH = 'cash',
  CARD = 'card',
}

@Entity('wallets')
@Index('IDX_wallet_name_user_id', ['name', 'user'], { unique: true })
export class Wallet {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @Exclude()
  user?: User;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'enum', enum: WalletType, default: WalletType.WALLET })
  @Expose()
  type: WalletType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Expose()
  initial_balance: number;

  @Column({ type: 'boolean', default: false })
  @Expose()
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @Exclude()
  deleted_at?: Date;
}
