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
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './transaction.service';

import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.create(createTransactionDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.update(id, updateTransactionDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.transactionService.remove(id, user);
  }
}
