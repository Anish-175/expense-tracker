import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //Loads environment variables from the .env file.
    //Configures TypeORM asynchronously, pulling database settings from environment variables.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'db'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'expense_tracker'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('DB_SYNC', false),
        logging: true,
      }),
    }),
    UserModule,
    AuthModule,
    CategoryModule,
    WalletModule,
    TransactionModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
