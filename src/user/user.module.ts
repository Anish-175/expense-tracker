import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { CategoryModule } from 'src/category/category.module';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletModule } from 'src/wallet/wallet.module';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionModule } from 'src/transaction/transaction.module';


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
