import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { AuthGuard } from '@nestjs/passport';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';

@Controller('wallets')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser() user: CurrentUserPayload, // full payload from token
  ) {
    return this.walletService.create(createWalletDto, user);
  }
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload): Promise<Wallet[]> {
    return this.walletService.findAll(user);
  }
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Wallet> {
    return this.walletService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Wallet> {
    return this.walletService.update(id, updateWalletDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.walletService.remove(id, user);
  }
}
