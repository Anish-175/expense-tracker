import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<Transaction> {
    try {
      // Validate wallet ownership
      const wallet = await this.walletRepository.findOne({
        where: { id: createTransactionDto.walletId },
        relations: ['user'],
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.user && wallet.user.id !== user.userId) {
        throw new ForbiddenException('You do not own this wallet');
      }

      // Validate category ownership (if provided)
      let category: Category | null;
      if (createTransactionDto.categoryId) {
        category = await this.categoryRepository.findOne({
          where: { id: createTransactionDto.categoryId },
          relations: ['user'],
        });
        if (!category) throw new NotFoundException('Category not found');
        if (category.user && category.user.id !== user.userId) {
          throw new ForbiddenException('You do not own this category');
        }
      }

      // Create transaction
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        userId: user.userId,
      });
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      console.error('Error in TransactionService.create:', {
        message: error.message,
        stack: error.stack,
        user,
        createTransactionDto,
      });
      throw new InternalServerErrorException(
        `Failed to create transaction: ${error.message}`,
      );
    }
  }

  async findAll(user: CurrentUserPayload): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.find({
        where: { userId: user.userId },
        order: { Date: 'DESC' },
      });
    } catch (error) {
      console.error('Error in TransactionService.findAll:', {
        message: error.message,
        stack: error.stack,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch transactions: ${error.message}`,
      );
    }
  }

  async findOne(id: string, user: CurrentUserPayload): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
      });
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
      if (transaction.userId !== user.userId) {
        throw new ForbiddenException(
          'You do not have permission to access this transaction',
        );
      }
      return transaction;
    } catch (error) {
      console.error('Error in TransactionService.findOne:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch transaction: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<Transaction> {
    try {
      const transaction = await this.findOne(id, user);

      // Optionally validate wallet/category ownership if updating those fields
      if (
        updateTransactionDto.walletId &&
        updateTransactionDto.walletId !== transaction.walletId
      ) {
        const wallet = await this.walletRepository.findOne({
          where: { id: updateTransactionDto.walletId },
          relations: ['user'],
        });
        if (!wallet) throw new NotFoundException('Wallet not found');
        if (wallet.user && wallet.user.id !== user.userId) {
          throw new ForbiddenException('You do not own this wallet');
        }
      }
      if (
        updateTransactionDto.categoryId &&
        updateTransactionDto.categoryId !== transaction.categoryId
      ) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateTransactionDto.categoryId },
          relations: ['user'],
        });
        if (!category) throw new NotFoundException('Category not found');
        if (category.user && category.user.id !== user.userId) {
          throw new ForbiddenException('You do not own this category');
        }
      }

      Object.assign(transaction, updateTransactionDto);
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      console.error('Error in TransactionService.update:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
        updateTransactionDto,
      });
      throw new InternalServerErrorException(
        `Failed to update transaction: ${error.message}`,
      );
    }
  }

  async remove(
    id: string,
    user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    try {
      const transaction = await this.findOne(id, user);
      await this.transactionRepository.softDelete(id);
      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      console.error('Error in TransactionService.remove:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to delete transaction: ${error.message}`,
      );
    }
  }
}
