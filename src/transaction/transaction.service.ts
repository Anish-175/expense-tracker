import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Category, CategoryType } from 'src/category/entities/category.entity';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { plainToInstance } from 'class-transformer';

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

  /* Helper methods */
  private mapTransactionToCategory(type: TransactionType): CategoryType {
    switch (type) {
      case TransactionType.INCOME:
        return CategoryType.INCOME;
      case TransactionType.EXPENSE:
        return CategoryType.EXPENSE;
      default:
        throw new Error('Transaction type cannot be mapped to a category');
    }
  }

  //Validate category ownership
  async validateCategoryOwnership(
    createTransactionDto: CreateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<void> {
    let category: Category | null;
    if (createTransactionDto.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: createTransactionDto.categoryId },
        relations: ['user'],
      });

      // Category must exist and belong to user
      if (!category) throw new NotFoundException('Category not found');
      if (category.user && category.user.id !== user.userId) {
        throw new ForbiddenException('You do not own this category');
      }

      // Transfer transactions cannot have a category
      if (createTransactionDto.type === TransactionType.TRANSFER) {
        throw new ForbiddenException(
          'Transfer transactions cannot have a category',
        );
      }

      // Category type must match transaction type
      if (
        category.type !==
        this.mapTransactionToCategory(createTransactionDto.type)
      ) {
        throw new ForbiddenException(
          `Category type ${category.type} does not match transaction type ${createTransactionDto.type}`,
        );
      }
    }
  }

  //Validate wallet ownership
  async validateWalletOwnership(
    createTransactionDto: CreateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { id: createTransactionDto.walletId },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.user && wallet.user.id !== user.userId) {
      throw new ForbiddenException('You do not own this wallet');
    }
  }

  //create transaction
  async create(
    createTransactionDto: CreateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
    try {
      // Validate wallet ownership
      await this.validateWalletOwnership(createTransactionDto, user);

      // Validate category ownership (if provided)
      await this.validateCategoryOwnership(createTransactionDto, user);

      // Create transaction
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        userId: user.userId,
      });
      const newTransaction = await this.transactionRepository.save(transaction);
      return plainToInstance(TransactionResponseDto, newTransaction, {});
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

  /*CRUD Methods */
  
  //find all transactions
  async findAll(user: CurrentUserPayload): Promise<TransactionResponseDto[]> {
    try {
      const transaction = await this.transactionRepository.find({
        where: { userId: user.userId },
        order: { date: 'DESC' },
      });
      return plainToInstance(TransactionResponseDto, transaction, {});
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

  //find one transaction
  async findOne(
    id: number,
    user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
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
      return plainToInstance(TransactionResponseDto, transaction, {});
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

  //update transaction
  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
    try {
      const transaction = await this.findOne(id, user);

      // Optionally validate wallet ownership if updating those fields
      if (
        updateTransactionDto.walletId &&
        updateTransactionDto.walletId !== transaction.walletId
      ) {
        await this.validateWalletOwnership(
          { ...transaction, ...updateTransactionDto } as CreateTransactionDto,
          user,
        );
      }
      // Category validation on update
      if (
        updateTransactionDto.categoryId &&
        updateTransactionDto.categoryId !== transaction.categoryId
      ) {
        await this.validateCategoryOwnership(
          { ...transaction, ...updateTransactionDto } as CreateTransactionDto,
          user,
        );
      }
      // Merge existing transaction with updates
      Object.assign(transaction, updateTransactionDto);
      const savedTransaction =
        await this.transactionRepository.save(transaction);
      return plainToInstance(TransactionResponseDto, savedTransaction, {});
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

  //remove transaction
  async remove(
    id: number,
    user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    try {
      await this.findOne(id, user);
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
