import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AnalyticsModule } from './analytics/analytics.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //Loads environment variables from the .env file.
    //Configures TypeORM asynchronously, pulling database settings from environment variables.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNC') === 'true',
        logging: true,
      }),
      inject: [ConfigService],
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