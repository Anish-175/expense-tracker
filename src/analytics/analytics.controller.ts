import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { AnalyticsService } from 'src/analytics/analytics.service';
import {
  CategoryBreakdownDto,
  OverallSummaryDto,
  PeriodRangeDto,
  QueryDto,
  TrendPointDto,
  walletsOverviewDto,
  WalletSummaryDto,
} from 'src/analytics/dto';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /*API for Overall analytics */

  // API to get overall summary(income, expense, balance)
  @Get('overall/summary')
  async overallSummary(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<OverallSummaryDto> {
    return await this.analyticsService.overallSummary(user.userId);
  }

  // API to get wallet summary(income, expense, balance, transactions)
  @Get('wallet/:id/summary')
  async walletSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseIntPipe()) walletId: number,
  ): Promise<WalletSummaryDto> {
    return await this.analyticsService.walletSummary(user.userId, walletId);
  }

  //API to get wallet overview
  @Get('wallets/overview')
  async walletsOverview(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<walletsOverviewDto[]> {
    return await this.analyticsService.walletOverview(user.userId);
  }

  //API to get period comparision
  @Post('compare-periods')
  comparePeriods(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    dto: {
      current: PeriodRangeDto;
      previous: PeriodRangeDto;
    },
  ) {
    return this.analyticsService.comparePeriods(
      user.userId,
      dto.current,
      dto.previous,
    );
  }

  /*  API to get period analytics - daily, weekly, monthly, custom range */
  @Get('daily')
  async dailyAnalytics(@CurrentUser() user: CurrentUserPayload): Promise<any> {
    return await this.analyticsService.dailyAnalytics(user.userId);
  }

  @Get('weekly')
  async weeklyAnalytics(@CurrentUser() user: CurrentUserPayload): Promise<any> {
    return await this.analyticsService.weeklyAnalytics(user.userId);
  }

  @Get('monthly')
  async monthlyAnalytics(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<any> {
    return await this.analyticsService.monthlyAnalytics(user.userId);
  }

  @Post('custom')
  async customRangeAnalytics(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: QueryDto,
  ): Promise<any> {
    return await this.analyticsService.customDateRangeAnalytics(
      user.userId,
      dto,
    );
  }

  /*API to get Trend analytics */
  @Get('trend/daily/:days')
  async dailyTrendAnalytics(
    @CurrentUser() user: CurrentUserPayload,
    @Param('days', new ParseIntPipe()) days: number,
  ): Promise<TrendPointDto[]> {
    return await this.analyticsService.dailyTrendAnalytics(user.userId, days);
  }

  @Get('trend/weekly/:weeks')
  async weeklyTrendAnalytics(
    @CurrentUser() user: CurrentUserPayload,
    @Param('weeks', new ParseIntPipe()) weeks: number,
  ): Promise<TrendPointDto[]> {
    return await this.analyticsService.weeklyTrendAnalytics(user.userId, weeks);
  }

  @Get('trend/monthly/:months')
  async monthlyTrendAnalytics(
    @CurrentUser() user: CurrentUserPayload,
    @Param('months', new ParseIntPipe()) months: number,
  ): Promise<TrendPointDto[]> {
    return await this.analyticsService.monthlyTrendAnalytics(
      user.userId,
      months,
    );
  }

  /* API to get category analytics */
  @Post('category-breakdown')
  async categoryBreakdown(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: QueryDto,
  ): Promise<CategoryBreakdownDto[]> {
    return await this.analyticsService.categoryBreakdown(user.userId, dto);
  }
}
