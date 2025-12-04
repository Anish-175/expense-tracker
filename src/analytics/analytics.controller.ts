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
import { DateRangeQueryDto, OverallSummaryDto, WalletSummaryDto } from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overall/summary')
  async overallSummary(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<OverallSummaryDto> {
    return await this.analyticsService.overallSummary(user.userId);
  }

  @Get('wallet/:id/summary')
  async walletSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseIntPipe()) walletId: number,
  ): Promise<WalletSummaryDto> {
    return await this.analyticsService.walletSummary(user.userId, walletId);
  }

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
      @CurrentUser() user: CurrentUserPayload, @Body() dto:DateRangeQueryDto
    ): Promise<any> {
      return await this.analyticsService.customDateRangeAnalytics(user.userId, dto);
    }
}
