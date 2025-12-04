
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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

}

// user.entity.ts
