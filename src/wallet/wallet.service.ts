import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Wallet, WalletType } from './entities/wallet.entity';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createWalletDto: CreateWalletDto,
    user: CurrentUserPayload, //get user from payload
  ): Promise<WalletResponseDto> {
    try {
      const { name } = createWalletDto; //destructure wallet fields from the dto

      // Check if wallet with that name exists, including soft-deleted
      const existingWallet = await this.walletRepository.findOne({
        where: {
          name,
          user: { id: user.userId },
        },
        withDeleted: true,
        relations: ['user'],
      });
      // Case 1: Already exists and is active
      if (existingWallet && !existingWallet.deleted_at) {
        throw new ConflictException(
          'Wallet name already exists for this scope',
        );
      }

      // Case 2: Soft-deleted — restore it
      if (existingWallet && existingWallet.deleted_at) {
        await this.walletRepository.recover(existingWallet);

        // Optionally update other fields (like icon, type) if provided in DTO
        Object.assign(existingWallet, createWalletDto);
        const restored = await this.walletRepository.save(existingWallet);
        return plainToInstance(WalletResponseDto, restored, {
          excludeExtraneousValues: true,
        });
      }

      //case-3 new wallet
      const foundUser = await this.userRepository.findOne({
        where: { id: user.userId },
        select: { id: true }, //only get id field.
      });

      //in case user does not exist
      if (!foundUser) {
        throw new NotFoundException('User not found');
      }

      //create a wallet with select fields and user is walletUser
      const wallet = this.walletRepository.create({
        ...createWalletDto,
        user: foundUser, //assign the found user data to wallet, userId in this case.
      });

      const savedWallet = await this.walletRepository.save(wallet); //saves data to database

      return plainToInstance(WalletResponseDto, savedWallet, {
        excludeExtraneousValues: true,
      }); //returns the saved data
    } catch (error) {
      //other errors
      console.error('Error in WalletService.create:', {
        message: error.message,
        stack: error.stack,
        user,
        createWalletDto,
      });
      throw new InternalServerErrorException(
        `Failed to create Wallet: ${error.message}`,
      );
    }
  }

  //returns all categories

  async findAll(user: CurrentUserPayload): Promise<WalletResponseDto[]> {
    try {
      const wallets = await this.walletRepository.find({
        where: [{ user: { id: user.userId } }],
      });

      return plainToInstance(WalletResponseDto, wallets, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in WalletService.findAll:', {
        message: error.message,
        stack: error.stack,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch categories: ${error.message}`,
      );
    }
  }

  async findOne(
    id: number,
    user: CurrentUserPayload,
  ): Promise<WalletResponseDto> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
      if (wallet.user && wallet.user.id !== user.userId) {
        throw new ForbiddenException(
          'You do not have permission to access this wallet',
        );
      }
      return plainToInstance(WalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in WalletService.findOne:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch wallet: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateWalletDto: UpdateWalletDto,
    user: CurrentUserPayload,
  ): Promise<WalletResponseDto> {
    try {
      const wallet = await this.findOne(id, user); // Get existing wallet

      if (updateWalletDto.name && updateWalletDto.name !== wallet.name) {
        // Check if a wallet (active or deleted) with the new name exists
        const existingWithDeleted = await this.walletRepository.findOne({
          where: {
            name: updateWalletDto.name,
            user: { id: user.userId },
          },
          withDeleted: true, // includes soft-deleted records
        });

        if (existingWithDeleted) {
          if (!existingWithDeleted.deleted_at) {
            // Active wallet with the same name already exists
            throw new ConflictException(
              'Wallet name already exists for this scope',
            );
          } else if (existingWithDeleted.id !== id) {
            // Soft-deleted wallet with the same name exists and is not the current wallet being updated — restore it or error
            await this.walletRepository.recover(existingWithDeleted);
            return plainToInstance(WalletResponseDto, existingWithDeleted, {
              excludeExtraneousValues: true,
            });
          }
        }
      }

      Object.assign(wallet, updateWalletDto);
      const savedWallet = await this.walletRepository.save(wallet);
      return plainToInstance(WalletResponseDto, savedWallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error in WalletService.update:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
        updateWalletDto,
      });

      throw new InternalServerErrorException(
        `Failed to update wallet: ${error.message}`,
      );
    }
  }

  //remove a wallet
  async remove(
    id: number,
    user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    try {
      const wallet = await this.findOne(id, user);
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
      await this.walletRepository.softDelete(id);
      return { message: 'Wallet deleted successfully' };
    } catch (error) {
      console.error('Error in WalletService.remove:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to delete wallet: ${error.message}`,
      );
    }
  }

  //default wallet
  async createDefaultWallet(userId: number): Promise<WalletResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = this.walletRepository.create({
      name: 'Default Wallet',
      type: WalletType.WALLET,
      initial_balance: 0,
      is_default: true,
      user,
    });

    return this.walletRepository.save(wallet);
  }
}
