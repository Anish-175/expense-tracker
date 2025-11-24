import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
