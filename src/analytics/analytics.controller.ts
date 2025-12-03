import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { SummaryDto } from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('total/summary')
  async overallSummary(@CurrentUser() user: CurrentUserPayload): Promise<SummaryDto> {
    return await this.analyticsService.overallSummary(user.userId)
  }


}
