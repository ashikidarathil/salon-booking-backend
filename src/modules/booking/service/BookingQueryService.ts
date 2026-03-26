import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IBookingRepository } from '../repository/IBookingRepository';
import { ISlotRepository } from '../../slot/repository/ISlotRepository';
import { IBookingQueryService } from './IBookingQueryService';
import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingMapper } from '../mapper/booking.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { resolveStylistId } from './booking.helpers';
import { StylistBookingPaginationQueryDto } from '../dto/booking.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { UserEntity } from '../../../common/types/userEntity';
import { BookingStatus, PaymentStatus } from '../../../models/booking.model';
import { BookingEntity } from '../../../common/types/bookingEntity';

@injectable()
export class BookingQueryService implements IBookingQueryService {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
    @inject(TOKENS.UserRepository)
    private readonly userRepo: IUserRepository,
  ) {}

  async getBookingDetails(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return BookingMapper.toResponse(booking);
  }

  async listUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepo.find({ userId: toObjectId(userId) });
    return BookingMapper.toResponseList(bookings);
  }

  async listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]> {
    const query: Record<string, unknown> = {};
    if (branchId) query.branchId = toObjectId(branchId);
    if (date) query.date = new Date(date);
    const bookings = await this.bookingRepo.find(query);
    return BookingMapper.toResponseList(bookings);
  }

  async listStylistBookings(
    userId: string,
    query: StylistBookingPaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const filter: Record<string, unknown> = {
      $or: [{ stylistId: toObjectId(stylistId) }, { 'items.stylistId': toObjectId(stylistId) }],
    };

    if (query.date) {
      const date = new Date(query.date);
      date.setUTCHours(0, 0, 0, 0);
      filter.date = date;
    }

    if (query.search) {
      const users = await this.userRepo.findAll({
        name: { $regex: query.search, $options: 'i' },
      } as Record<string, unknown>);
      const userIds = users.map((u: UserEntity) => toObjectId(u.id));
      filter.userId = { $in: userIds };
    }

    const result = await this.bookingRepo.findPaginated({
      ...query,
      ...filter,
      sortBy: query.sortBy || 'date',
      sortOrder: query.sortOrder || 'desc',
    });

    return {
      data: BookingMapper.toResponseList(result.data),
      pagination: result.pagination,
    };
  }

  async getTodayBookings(branchId?: string): Promise<BookingResponseDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const query: Record<string, unknown> = { date: today };
    if (branchId) query.branchId = toObjectId(branchId);
    const bookings = await this.bookingRepo.find(query);
    return BookingMapper.toResponseList(bookings);
  }

  async getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const result = await this.listStylistBookings(userId, {
      date: today.toISOString(),
      limit: 100,
      page: 1,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    return result.data;
  }

  async getStylistStats(
    userId: string,
    period: string = 'today',
    date?: string,
  ): Promise<Record<string, unknown>> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const filter: Record<string, unknown> = {
      $or: [{ stylistId: toObjectId(stylistId) }, { 'items.stylistId': toObjectId(stylistId) }],
    };

    let startDate: Date;
    let endDate: Date;
    let groupBy: 'hour' | 'day' | 'month' = 'hour';

    const baseDate = date ? new Date(date) : new Date();

    if (period === 'today') {
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
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setUTCHours(23, 59, 59, 999);
    }

    filter.date = { $gte: startDate, $lte: endDate };

    const bookings = await this.bookingRepo.find(filter);

    const summary = {
      total: bookings.length,
      confirmed: bookings.filter((b: BookingEntity) => b.status === BookingStatus.CONFIRMED).length,
      pending: bookings.filter((b: BookingEntity) => b.status === BookingStatus.PENDING_PAYMENT)
        .length,
      cancelled: bookings.filter((b: BookingEntity) => b.status === BookingStatus.CANCELLED).length,
      completed: bookings.filter((b: BookingEntity) => b.status === BookingStatus.COMPLETED).length,
      revenue: bookings
        .filter(
          (b: BookingEntity) =>
            b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.FAILED,
        )
        .reduce((sum: number, b: BookingEntity) => sum + (b.payableAmount ?? b.totalPrice ?? 0), 0),
    };

    const chartData: { label: string; bookings: number; revenue: number }[] = [];

    if (groupBy === 'hour') {
      for (let i = 0; i < 24; i++) {
        const hourStr = i.toString().padStart(2, '0');
        const label = `${hourStr}:00`;
        const hourBookings = bookings.filter((b: BookingEntity) => b.startTime.startsWith(hourStr));
        chartData.push({
          label,
          bookings: hourBookings.length,
          revenue: hourBookings
            .filter(
              (b: BookingEntity) =>
                b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.FAILED,
            )
            .reduce(
              (sum: number, b: BookingEntity) => sum + (b.payableAmount ?? b.totalPrice ?? 0),
              0,
            ),
        });
      }
    } else if (groupBy === 'day') {
      const days = period === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(endDate);
        d.setUTCDate(d.getUTCDate() - i);
        const label = d.toISOString().split('T')[0];
        const dayBookings = bookings.filter(
          (b: BookingEntity) => b.date.toISOString().split('T')[0] === label,
        );
        chartData.push({
          label,
          bookings: dayBookings.length,
          revenue: dayBookings
            .filter(
              (b: BookingEntity) =>
                b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.FAILED,
            )
            .reduce(
              (sum: number, b: BookingEntity) => sum + (b.payableAmount ?? b.totalPrice ?? 0),
              0,
            ),
        });
      }
    } else if (groupBy === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(endDate);
        d.setUTCMonth(d.getUTCMonth() - i);
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth();
        const label = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        const monthBookings = bookings.filter((b: BookingEntity) => {
          const bDate = b.date;
          return bDate.getUTCFullYear() === year && bDate.getUTCMonth() === month;
        });
        chartData.push({
          label,
          bookings: monthBookings.length,
          revenue: monthBookings
            .filter(
              (b: BookingEntity) =>
                b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.FAILED,
            )
            .reduce(
              (sum: number, b: BookingEntity) => sum + (b.payableAmount ?? b.totalPrice ?? 0),
              0,
            ),
        });
      }
    }

    const statusBreakdown = [
      { name: 'Confirmed', value: summary.confirmed, color: '#10b981' },
      { name: 'Pending', value: summary.pending, color: '#f59e0b' },
      { name: 'Cancelled', value: summary.cancelled, color: '#ef4444' },
      { name: 'Completed', value: summary.completed, color: '#3b82f6' },
    ];

    return {
      summary,
      chartData,
      statusBreakdown,
      period,
      range: { start: startDate, end: endDate },
    };
  }

  async checkExpiredBookings(): Promise<number> {
    const expiredBookings = await this.bookingRepo.find({
      status: BookingStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
      paymentWindowExpiresAt: { $lt: new Date() },
    });

    let count = 0;
    for (const booking of expiredBookings) {
      const updated = await this.bookingRepo.update(
        { _id: toObjectId(booking.id) },
        {
          status: BookingStatus.FAILED,
          paymentStatus: PaymentStatus.FAILED,
          cancelledBy: 'SYSTEM',
          cancelledReason: 'Payment window expired (15 minutes)',
          cancelledAt: new Date(),
        },
      );
      if (updated) count++;
    }
    return count;
  }
}
