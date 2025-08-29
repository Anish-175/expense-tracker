import { Exclude, Expose } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
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
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true }) //email
  @Expose()
  email: string;

  @Column({ type: 'varchar', length: 255 }) //password hashed
  @Exclude()
  password: string;

  @CreateDateColumn({ type: 'timestamptz' }) //timestamp with timezones auto
  @Exclude()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Exclude()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) //for soft deletes
  @Exclude()
  deleted_at?: Date;

  @OneToMany(() => Category, (category) => category.user)
  @Exclude()
  categories: Category[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  @Exclude()
  wallet: Wallet[];
}

// relationships later
// user.entity.ts
