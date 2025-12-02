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
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  user?: User;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: WalletType, default: WalletType.WALLET })
  type: WalletType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  initial_balance: number;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}
