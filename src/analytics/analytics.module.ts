import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { AnalyticsRepository } from './repository/analytics.repository';
import { WalletService } from 'src/wallet/wallet.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet, User]),
  ],
  providers: [AnalyticsService, AnalyticsRepository, WalletService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
