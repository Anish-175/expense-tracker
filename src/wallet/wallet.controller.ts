import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { WalletService } from './wallet.service';

@Controller('wallets')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  //create a new wallet
  @Post()
  create(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser() user: CurrentUserPayload, // full payload from token
  ) {
    return this.walletService.create(createWalletDto, user);
  }

  //get all wallets for a user
  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WalletResponseDto[]> {
    return this.walletService.findAll(user);
  }

  //get a single wallet by id
  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WalletResponseDto> {
    return this.walletService.findOne(id, user);
  }

  //update a wallet by id
  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateWalletDto: UpdateWalletDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WalletResponseDto> {
    return this.walletService.update(id, updateWalletDto, user);
  }

  //delete a wallet by id
  @Delete(':id')
  remove(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.walletService.remove(id, user);
  }
}
