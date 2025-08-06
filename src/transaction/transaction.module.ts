import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, Category])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
