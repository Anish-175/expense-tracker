import { DateRangeQueryDto } from "../dto/analytics.dto";

export class DateRange {
  //get today's date range
  static today() {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );

    return { start, end };
  }

  //get this week's date range (Sunday to Saturday)
  static thisWeek() {
    const now = new Date();

    // get day of week in UTC (0 = Sunday)
    const utcDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ).getUTCDay();

    // start of this week (Sunday)
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - utcDay,
      ),
    );

    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - utcDay + 7,
      ),
    );

    return { start, end };
  }

  //get this month's date range
  static thisMonth() {
    const now = new Date();

    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    return { start, end };
  }

  //custom date range
  static custom(startDate: Date, endDate: Date) {
    const start = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
      ),
    );

    const end = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
      ),
    );

    return { start, end };
  }

  /**
   * Normalize dates from DTO input (strings) or partial input
   * Optionally provide defaults (default = this month)
   */
  static normalizeDates(dto: DateRangeQueryDto) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (dto.startDate && dto.endDate) {
      ({ start, end } = DateRange.custom(
        new Date(dto.startDate),
        new Date(dto.endDate),
      ));
    } else if (dto.startDate) {
      start = new Date(
        Date.UTC(
          new Date(dto.startDate).getUTCFullYear(),
          new Date(dto.startDate).getUTCMonth(),
          new Date(dto.startDate).getUTCDate(),
        ),
      );
      end = undefined;
    } else if (dto.endDate) {
      start = undefined;
      end = new Date(
        Date.UTC(
          new Date(dto.endDate).getUTCFullYear(),
          new Date(dto.endDate).getUTCMonth(),
          new Date(dto.endDate).getUTCDate() + 1,
        ),
      );
    } else {
      // Default to this month if no dates provided
      ({ start, end } = DateRange.thisMonth());
    }

    return { start, end };
  }

  //preset date ranges
  static fromPreset(preset: 'today' | 'week' | 'month') {
    switch (preset) {
      case 'today':
        return DateRange.today();
      case 'week':
        return DateRange.thisWeek();
      case 'month':
      default:
        return DateRange.thisMonth();
    }
  }
}

