import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { IEscrowRepository } from '../../escrow/repository/IEscrowRepository';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { IAdminDashboardService } from './IAdminDashboardService';
import { AdminDashboardStatsDto, AdminStatsQueryDto } from '../dto/admin.stats.dto';
import { BookingStatus, PaymentStatus } from '../../../models/booking.model';
import { UserRole } from '../../../common/enums/userRole.enum';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { EscrowStatus } from '../../../models/escrow.model';

@injectable()
export class AdminDashboardService implements IAdminDashboardService {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(TOKENS.EscrowRepository)
    private readonly escrowRepo: IEscrowRepository,
    @inject(TOKENS.StylistRepository)
    private readonly stylistRepo: IStylistRepository,
  ) {}

  async getDashboardStats(query: AdminStatsQueryDto): Promise<AdminDashboardStatsDto> {
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
      startDate.setUTCDate(startDate.getUTCDate() - 6);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    } else if (period === 'month') {
      startDate = new Date(baseDate);
      startDate.setUTCDate(startDate.getUTCDate() - 29);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    } else if (period === 'year') {
      startDate = new Date(baseDate);
      startDate.setUTCMonth(0, 1);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCMonth(11, 31);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'month';
    } else {
      startDate = new Date(baseDate);
      startDate.setUTCDate(startDate.getUTCDate() - 29);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
      groupBy = 'day';
    }

    // 1. Fetch data efficiently
    // Use empty array [] for population to avoid unnecessary large fetches and fix [object Object] ID bug
    const [allBookings, allUsers, escrowItems] = await Promise.all([
      this.bookingRepo.find(
        {
          status: {
            $in: [
              BookingStatus.COMPLETED,
              BookingStatus.CONFIRMED,
              BookingStatus.CANCELLED,
              BookingStatus.PENDING_PAYMENT,
            ],
          },
        },
        [],
      ),
      this.userRepo.findAll({}),
      this.escrowRepo.find({ status: EscrowStatus.HELD }),
    ]);

    // 2. Filter bookings by period
    const bookingsInPeriod = allBookings.filter((b) => {
      const bDate = new Date(b.date);
      return bDate >= startDate && bDate <= endDate;
    });

    const completedInPeriod = bookingsInPeriod.filter((b) => b.status === BookingStatus.COMPLETED);

    // 3. Summary Metrics (Scoped to Period)
    const totalRevenue = completedInPeriod.reduce(
      (sum, b) => sum + (b.payableAmount || b.totalPrice || 0),
      0,
    );
    const totalBookings = bookingsInPeriod.length;
    const activeCustomers = allUsers.filter((u) => u.role === UserRole.USER && u.isActive).length;
    const activeStylists = allUsers.filter(
      (u) => u.role === UserRole.STYLIST && (u.status === 'ACTIVE' || u.status === 'ACCEPTED'),
    ).length;
    const pendingEscrow = escrowItems.reduce((sum, item) => sum + item.amount, 0);

    const summary = {
      totalRevenue,
      totalBookings,
      activeStylists,
      totalCustomers: activeCustomers,
      pendingEscrow,
    };

    // 4. Revenue Trend
    const revenueTrend: any[] = [];
    const points = period === 'today' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12;

    for (let i = 0; i < points; i++) {
      let label = '';
      let dateFilter: (d: Date) => boolean;

      if (groupBy === 'hour') {
        label = `${i.toString().padStart(2, '0')}:00`;
        const endDayStr = endDate.toISOString().split('T')[0];
        dateFilter = (d) => d.getUTCHours() === i && d.toISOString().split('T')[0] === endDayStr;
      } else if (groupBy === 'day') {
        const d = new Date(endDate);
        d.setUTCDate(d.getUTCDate() - (points - 1 - i));
        label = d.toISOString().split('T')[0];
        dateFilter = (date) => date.toISOString().split('T')[0] === label;
      } else {
        const d = new Date(endDate);
        d.setUTCMonth(d.getUTCMonth() - (points - 1 - i));
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth();
        label = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        dateFilter = (date) => date.getUTCFullYear() === year && date.getUTCMonth() === month;
      }

      const periodTrendBookings = completedInPeriod.filter((b) => dateFilter(new Date(b.date)));

      const rev = periodTrendBookings.reduce(
        (sum, b) => sum + (b.payableAmount || b.totalPrice || 0),
        0,
      );

      revenueTrend.push({ label, revenue: rev, bookings: periodTrendBookings.length });
    }

    // 5. Booking Status Breakdown
    const bookingStatusBreakdown = [
      {
        name: 'Completed',
        value: bookingsInPeriod.filter((b) => b.status === BookingStatus.COMPLETED).length,
        color: '#10b981',
      },
      {
        name: 'Confirmed',
        value: bookingsInPeriod.filter((b) => b.status === BookingStatus.CONFIRMED).length,
        color: '#3b82f6',
      },
      {
        name: 'Cancelled',
        value: bookingsInPeriod.filter((b) => b.status === BookingStatus.CANCELLED).length,
        color: '#ef4444',
      },
      {
        name: 'Pending',
        value: bookingsInPeriod.filter((b) => b.status === BookingStatus.PENDING_PAYMENT).length,
        color: '#f59e0b',
      },
    ];

    // 6. User Growth
    const userGrowth: any[] = [];
    revenueTrend.forEach((rt) => {
      const usersInPeriod = allUsers.filter((u) => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        const y = uDate.getUTCFullYear();
        const m = uDate.getUTCMonth() + 1;

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
        customers: usersInPeriod.filter((u) => u.role === UserRole.USER).length,
        stylists: usersInPeriod.filter((u) => u.role === UserRole.STYLIST).length,
      });
    });

    // 7. Top Performing Stylists (Scoped to Period)
    const stylistStatsMap = new Map<string, { revenue: number; bookings: number }>();
    completedInPeriod.forEach((b) => {
      const sId = (b.stylistId as any)?._id?.toString() || b.stylistId?.toString();
      if (!sId) return;

      const stats = stylistStatsMap.get(sId) || { revenue: 0, bookings: 0 };
      stats.revenue += b.payableAmount || b.totalPrice || 0;
      stats.bookings += 1;
      stylistStatsMap.set(sId, stats);
    });

    const topStylistIds = Array.from(stylistStatsMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    const topStylists = await Promise.all(
      topStylistIds.map(async ([id, stats]) => {
        const stylist = await this.stylistRepo.getById(id);
        return {
          id,
          name: stylist?.name || 'Unknown',
          avatar: stylist?.profilePicture || null,
          revenue: stats.revenue,
          bookings: stats.bookings,
          rating: 4.8,
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
}
