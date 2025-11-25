import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { AnalyticsService } from 'src/analytics/analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overall/net-balance')
  async overallNetBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getOverallNetBalance(user.userId);
  }

  @Get('wallet/:walletId/expenses')
  async totalExpenses(
    @Param('walletId', ParseIntPipe) walletId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getTotalExpenses(user.userId, walletId);
  }

  @Get('wallet/:walletId/income')
  async totalIncome(
    @Param('walletId', ParseIntPipe) walletId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getTotalIncome(user.userId, walletId);
  }

  @Get('wallet/:walletId/net-balance')
  async netBalance(
    @Param('walletId', ParseIntPipe) walletId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getNetBalance(user.userId, walletId);
  }

  //monthly income
  @Get('overall/monthly/income')
  async incomeThisMonth(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getIncomeThisMonth(user.userId);
  }

  //monthly expenses
  @Get('overall/monthly/expenses')
  async expensesThisMonth(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getExpensesThisMonth(user.userId);
  }
}
