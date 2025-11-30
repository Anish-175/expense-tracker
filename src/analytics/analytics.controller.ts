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

  @Get('overall/remaining-balance')
  async overallNetBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getOverallRemainingBalance(user.userId);
  }

  @Get('wallets/overview')
  async walletsOverview(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.walletOverview(user.userId);
  }

  // @Get('wallets/:walletId/expenses')
  // async totalExpenses(
  //   @Param('walletId', ParseIntPipe) walletId: number,
  //   @CurrentUser() user: CurrentUserPayload,
  // ) {
  //   return this.analyticsService.getTotalExpenses(user.userId, walletId);
  // }

  // @Get('wallet/:walletId/income')
  // async totalIncome(
  //   @Param('walletId', ParseIntPipe) walletId: number,
  //   @CurrentUser() user: CurrentUserPayload,
  // ) {
  //   return this.analyticsService.getTotalIncome(user.userId, walletId);
  // }

  // @Get('wallet/:walletId/remaining-balance')
  // async netBalance(
  //   @Param('walletId', ParseIntPipe) walletId: number,
  //   @CurrentUser() user: CurrentUserPayload,
  // ) {
  //   return this.analyticsService.getRemainingBalance(user.userId, walletId);
  // }


  /* monthly analytics endpoints */
  @Get('monthly/overview')
  async monthlyOverview(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getMonthlyOverview(user.userId);
  }

  //monthly income
  // @Get('monthly/income')
  // async incomeThisMonth(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getIncomeThisMonth(user.userId);
  // }

  // //monthly expenses
  // @Get('monthly/expenses')
  // async expensesThisMonth(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getExpensesThisMonth(user.userId);
  // }

  // @Get('monthly/transactions')
  // async monthlyTransactions(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getTransactionsThisMonth(user.userId);
  // }

  // @Get('monthly/balance')
  // async monthlyBalance(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getNetBalanceThisMonth(user.userId);
  // }


  // //daily expenses
  // @Get('daily/overview')
  // async dailyExpenses(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getDailyOverview(user.userId);
  // }

  // @Get('weekly/overview')
  // async weeklyExpenses(@CurrentUser() user: CurrentUserPayload) {
  //   return this.analyticsService.getWeeklyOverview(user.userId);
  // }
}
