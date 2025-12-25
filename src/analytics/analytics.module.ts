import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { AnalyticsRepository } from './repository/analytics.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, User])],
  providers: [AnalyticsService, AnalyticsRepository],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
