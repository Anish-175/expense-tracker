import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { AnalyticsService } from 'src/analytics/analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
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

  /* monthly analytics endpoints */
  @Get('monthly/overview')
  async monthlyOverview(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getMonthlyOverview(user.userId);
  }
}
