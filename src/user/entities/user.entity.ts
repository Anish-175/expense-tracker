import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() // changed from 'uuid'
  id: number; // changed from string

  @Column({ type: 'varchar', length: 255 }) //user name
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true }) //email
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 }) //password hashed
  password: string;

  @Exclude()
  @Column({ name: 'refresh_token', type: 'text', nullable: true }) //refresh token
  refreshToken?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) //timestamp with timezones auto
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) //for soft deletes
  deletedAt?: Date;
}

// user.entity.ts
