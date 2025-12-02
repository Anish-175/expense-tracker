import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { Transaction } from './entities/transaction.entity';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
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
  findAll(@CurrentUser() user: CurrentUserPayload): Promise<TransactionResponseDto[]> {
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
