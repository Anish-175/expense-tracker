import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/entities/category.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // Injects the User repository for database interactions.
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    //instantiates the Repository from typeORM
    private categoryService: CategoryService,
    private walletService: WalletService,
  ) {}

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  //Retrieves a user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true, //allows finding soft deleted users
    });
  }

  //Creates a user and saves to database
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);
      await this.categoryService.initializeDefaultCategories(user);
      await this.walletService.createDefaultWallet(savedUser.id);
      return savedUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('unique constraint')
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  //find user by id even soft deleted users to allow restoration
  async findById(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  //update user by id
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } }); // throws NotFoundException if not found
    console.log('Updating user with ID:', id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    //if name is changed
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    // Check for email uniqueness (if email is being changed)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      //check if email is given and if user is trying to change email
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }, //check if the given email already exists
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    // Only set password if provided
    if (updateUserDto.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      user.password = hashedPassword;
    }

    if (updateUserDto.refreshToken || updateUserDto.refreshToken === null) {
      user.refreshToken = updateUserDto.refreshToken;
    }

    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  //delete logged in user by id

  async softDelete(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.transactionRepository.softDelete({ userId });
    await this.walletRepository.softDelete({ userId });
    await this.categoryRepository.softDelete({ userId });
    await this.userRepository.softDelete(userId);
  }

  //refresh query
  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refresh_token')
      .where('user.id = :id', { id })
      .getOne();
  }
}
