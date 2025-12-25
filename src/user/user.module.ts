import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { Category } from 'src/category/entities/category.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionModule } from 'src/transaction/transaction.module';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletModule } from 'src/wallet/wallet.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Wallet, Transaction]),
    CategoryModule,
    WalletModule,
    TransactionModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
