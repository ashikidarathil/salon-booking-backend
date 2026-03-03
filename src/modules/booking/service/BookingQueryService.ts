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
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { UserEntity } from '../../../common/types/userEntity';

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
    const bookings = await this.bookingRepo.find({ userId });
    return bookings.map(BookingMapper.toResponse);
  }

  async listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]> {
    const query: Record<string, unknown> = {};
    if (branchId) query.branchId = branchId;
    if (date) query.date = new Date(date);
    const bookings = await this.bookingRepo.find(query);
    return bookings.map(BookingMapper.toResponse);
  }

  async listStylistBookings(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const filter: Record<string, unknown> = {
      $or: [{ stylistId: toObjectId(stylistId) }, { 'items.stylistId': toObjectId(stylistId) }],
    };

    if (query.date) {
      const date = new Date(query.date as string);
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

    const paginatedQuery: PaginationQueryDto = {
      ...query,
      sortBy: query.sortBy || 'date',
      sortOrder: query.sortOrder || 'desc',
    };

    const result = await this.bookingRepo.findPaginated({
      ...paginatedQuery,
      ...filter,
    } as unknown as PaginationQueryDto);

    return {
      data: result.data.map(BookingMapper.toResponse),
      pagination: result.pagination,
    };
  }

  async getTodayBookings(branchId?: string): Promise<BookingResponseDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const query: Record<string, unknown> = { date: today };
    if (branchId) query.branchId = branchId;
    const bookings = await this.bookingRepo.find(query);
    return bookings.map(BookingMapper.toResponse);
  }

  async getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const result = await this.listStylistBookings(userId, {
      date: today.toISOString(),
      limit: 100,
    });
    return result.data;
  }
}
