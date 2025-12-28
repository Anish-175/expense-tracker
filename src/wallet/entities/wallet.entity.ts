import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WalletType {
  WALLET = 'wallet',
  BANK = 'bank',
  CASH = 'cash',
  CARD = 'card',
}

@Entity('wallets')
@Index('IDX_wallet_name_user_id', ['name', 'userId'], { unique: true })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: WalletType, default: WalletType.WALLET })
  type: WalletType;

  @Column({
    name: 'initial_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  initialBalance: number;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
