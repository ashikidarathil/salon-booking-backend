import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { IReviewRepository } from '../../review/repository/IReviewRepository';
import { BookingStatus } from '../../../models/booking.model';
import { BookingEntity, BookingRef } from '../../../common/types/bookingEntity';
import { UserRole } from '../../../common/enums/userRole.enum';
import { AdminRawStatsData } from '../repository/IAdminRepository';
import { UserEntity } from '../../../common/types/userEntity';
import { IEscrow } from '../../../models/escrow.model';
import { AdminDashboardStatsDto, AdminStatsQueryDto } from '../dto/admin.dto';

@injectable()
export class AdminMapper {
  constructor(
    @inject(TOKENS.StylistRepository)
    private readonly stylistRepo: IStylistRepository,
    @inject(TOKENS.ReviewRepository)
    private readonly reviewRepo: IReviewRepository,
  ) {}

  async toDashboardStatsDto(
    data: AdminRawStatsData,
    query: AdminStatsQueryDto,
  ): Promise<AdminDashboardStatsDto> {
    const { allBookings, allUsers, escrowItems } = data;
    const { period = 'month', startDate: qStart, endDate: qEnd } = query;

    let startDate: Date;
    let endDate: Date;
    let groupBy: 'hour' | 'day' | 'month' = 'day';

    const baseDate = qEnd ? new Date(qEnd) : new Date();

    if (qStart && qEnd) {
      startDate = new Date(qStart);
      endDate = new Date(qEnd);
      groupBy = 'day';
    } else if (period === 'today') {
      startDate = new Date(baseDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'hour';
    } else if (period === 'week') {
      startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    } else if (period === 'month') {
      startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    } else if (period === 'year') {
      startDate = new Date(baseDate.getFullYear(), 0, 1);
      endDate = new Date(baseDate.getFullYear(), 11, 31, 23, 59, 59, 999);
      groupBy = 'month';
    } else {
      startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    }

    const bookingsInPeriod = allBookings.filter((b: BookingEntity) => {
      const bDate = b.date;
      return bDate >= startDate && bDate <= endDate;
    });

    const completedInPeriod = bookingsInPeriod.filter(
      (b: BookingEntity) => b.status === BookingStatus.COMPLETED,
    );

    const totalRevenue = completedInPeriod.reduce(
      (sum: number, b: BookingEntity) => sum + (b.payableAmount || b.totalPrice || 0),
      0,
    );

    const activeCustomers = allUsers.filter(
      (u: UserEntity) => u.role === UserRole.USER && u.isActive,
    ).length;
    const activeStylists = allUsers.filter(
      (u: UserEntity) =>
        u.role === UserRole.STYLIST && (u.status === 'ACTIVE' || u.status === 'ACCEPTED'),
    ).length;
    const pendingEscrow = escrowItems.reduce((sum: number, item: IEscrow) => sum + item.amount, 0);

    const summary = {
      totalRevenue,
      totalBookings: completedInPeriod.length,
      activeStylists,
      totalCustomers: activeCustomers,
      pendingEscrow,
    };

    const revenueTrend: { label: string; revenue: number; bookings: number }[] = [];
    const dateRange = this.getDateRange(startDate, endDate, groupBy);

    for (const date of dateRange) {
      const label = this.formatDateLabel(date, groupBy);
      const { year, month } = this.getDateParts(date);

      const dateFilter = (d: Date) => {
        if (groupBy === 'hour') {
          return (
            d.toISOString().split('T')[0] === date.toISOString().split('T')[0] &&
            d.getHours() === date.getHours()
          );
        } else if (groupBy === 'day') {
          return d.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        }
        return d.getFullYear() === year && d.getMonth() === month - 1;
      };

      const periodTrendBookings = completedInPeriod.filter((b: BookingEntity) =>
        dateFilter(b.date),
      );
      const rev = periodTrendBookings.reduce(
        (sum: number, b: BookingEntity) => sum + (b.payableAmount || b.totalPrice || 0),
        0,
      );

      revenueTrend.push({
        label,
        revenue: rev,
        bookings: periodTrendBookings.length,
      });
    }

    const bookingStatusBreakdown = [
      {
        name: 'Completed',
        value: bookingsInPeriod.filter((b: BookingEntity) => b.status === BookingStatus.COMPLETED)
          .length,
        color: '#10b981',
      },
      {
        name: 'Confirmed',
        value: bookingsInPeriod.filter((b: BookingEntity) => b.status === BookingStatus.CONFIRMED)
          .length,
        color: '#3b82f6',
      },
      {
        name: 'Cancelled',
        value: bookingsInPeriod.filter((b: BookingEntity) => b.status === BookingStatus.CANCELLED)
          .length,
        color: '#ef4444',
      },
      {
        name: 'Pending',
        value: bookingsInPeriod.filter(
          (b: BookingEntity) => b.status === BookingStatus.PENDING_PAYMENT,
        ).length,
        color: '#f59e0b',
      },
    ];

    const userGrowth: { label: string; customers: number; stylists: number }[] = [];
    revenueTrend.forEach((rt) => {
      const usersInPeriod = allUsers.filter((u: UserEntity) => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        const y = uDate.getFullYear();
        const m = uDate.getMonth() + 1;

        if (groupBy === 'hour') {
          const uDateStr = uDate.toISOString().split('T')[0];
          const endDayStr = endDate.toISOString().split('T')[0];
          return (
            uDateStr === endDayStr &&
            uDate.getUTCHours().toString().padStart(2, '0') + ':00' === rt.label
          );
        } else if (groupBy === 'day') {
          return uDate.toISOString().split('T')[0] === rt.label;
        } else if (groupBy === 'month') {
          return `${y}-${m.toString().padStart(2, '0')}` === rt.label;
        }
        return false;
      });

      userGrowth.push({
        label: rt.label,
        customers: usersInPeriod.filter((u: UserEntity) => u.role === UserRole.USER).length,
        stylists: usersInPeriod.filter((u: UserEntity) => u.role === UserRole.STYLIST).length,
      });
    });

    const stylistStatsMap = new Map<string, { revenue: number; bookings: number }>();
    const getRefId = (ref: BookingRef): string =>
      ref && typeof ref === 'object' && '_id' in ref ? ref._id.toString() : (ref as string);

    completedInPeriod.forEach((b: BookingEntity) => {
      const sId = getRefId(b.stylistId);
      if (!sId) return;
      const stats = stylistStatsMap.get(sId) || { revenue: 0, bookings: 0 };
      stats.revenue += b.payableAmount || b.totalPrice || 0;
      stats.bookings += 1;
      stylistStatsMap.set(sId, stats);
    });

    const topStylists = await Promise.all(
      Array.from(stylistStatsMap.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(async ([id, stats]) => {
          const [stylist, ratingData] = await Promise.all([
            this.stylistRepo.getById(id),
            this.reviewRepo.getStylistRating(id),
          ]);
          return {
            id,
            name: stylist?.name || 'Unknown',
            avatar: stylist?.profilePicture || null,
            revenue: stats.revenue,
            bookings: stats.bookings,
            rating: ratingData.averageRating || 0,
          };
        }),
    );

    return {
      summary,
      revenueTrend,
      bookingStatusBreakdown,
      topStylists,
      userGrowth,
    };
  }

  private getDateRange(start: Date, end: Date, groupBy: string): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      if (groupBy === 'hour') {
        current.setUTCHours(current.getUTCHours() + 1);
      } else if (groupBy === 'day') {
        current.setUTCDate(current.getUTCDate() + 1);
      } else {
        current.setUTCMonth(current.getUTCMonth() + 1);
      }
    }
    return dates;
  }

  private formatDateLabel(date: Date, groupBy: string): string {
    if (groupBy === 'hour') {
      return `${date.getUTCHours().toString().padStart(2, '0')}:00`;
    } else if (groupBy === 'day') {
      return date.toISOString().split('T')[0];
    } else {
      return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    }
  }

  private getDateParts(date: Date) {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
    };
  }
}
