import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const config = new ConfigService();

//use config module to pull data from environment
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST', 'db'),
  port: config.get<number>('DATABASE_PORT', 5432),
  username: config.get<string>('DATABASE_USER', 'postgres'),
  password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: config.get<string>('DATABASE_NAME', 'expense_tracker'),
  migrations: [__dirname + '/../**/*.migration.{js,ts}'],
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: config.get<boolean>('DB_SYNC'),
  logging: true,
});
