import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { AppDataSource } from './database/data-source';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), //Loads environment variables from the .env file.
    //Configures TypeORM asynchronously, pulling database settings from environment variables.
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options,
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
