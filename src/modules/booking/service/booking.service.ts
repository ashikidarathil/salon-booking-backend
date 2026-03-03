import { BookingItemInput } from '../dto/booking.request.dto';
import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingMapper } from '../mapper/booking.mapper';
import { IBookingService } from './IBookingService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IBookingRepository } from '../repository/IBookingRepository';
import { ISlotService } from '../../slot/service/ISlotService';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { BOOKING_DEFAULTS } from '../constants/booking.constants';
import { SLOT_PREFIXES } from '../../slot/constants/slot.constants';
import { BookingStatus, IBookingItem } from '../../../models/booking.model';
import { IBookingValidator } from './IBookingValidator';
import { IBookingQueryService } from './IBookingQueryService';
import { ISlotRepository } from '../../slot/repository/ISlotRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { resolveStylistId, timeToMinutes, minutesToTime } from './booking.helpers';
import { UserRole } from '../../../common/enums/userRole.enum';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.SlotService)
    private readonly slotService: ISlotService,
    @inject(TOKENS.BookingValidator)
    private readonly bookingValidator: IBookingValidator,
    @inject(TOKENS.BookingQueryService)
    private readonly bookingQueryService: IBookingQueryService,
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
  ) {}

  async createBooking(
    userId: string,
    _slotId: string | undefined,
    items: BookingItemInput[],
    notes?: string,
  ): Promise<BookingResponseDto> {
    const branchId = items[0].slotId.startsWith(SLOT_PREFIXES.DYNAMIC)
      ? items[0].slotId.split('_')[1]
      : BOOKING_DEFAULTS.BRANCH_ID;

    const bookingItems = await this.prepareBookingItems(branchId, items);

    const booking = await this.bookingRepo.create({
      userId: toObjectId(userId),
      branchId: toObjectId(branchId),
      items: bookingItems,
      stylistId: bookingItems[0].stylistId,
      date: bookingItems[0].date,
      startTime: bookingItems[0].startTime,
      endTime: bookingItems[bookingItems.length - 1].endTime,
      totalPrice: bookingItems.reduce((sum: number, item: IBookingItem) => sum + item.price, 0),
      status: BookingStatus.CONFIRMED,
      notes,
    });

    return BookingMapper.toResponse(booking);
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
    role?: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const stylistId =
      role === UserRole.STYLIST ? await resolveStylistId(userId, this.slotRepo) : undefined;

    if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    this.bookingValidator.validateLeadTime(booking.startTime, booking.date);

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledBy = (role?.toUpperCase() as UserRole) || UserRole.USER;
    booking.cancelledReason = reason;
    booking.cancelledAt = new Date();
    await this.bookingRepo.update({ _id: toObjectId(bookingId) }, booking);

    return BookingMapper.toResponse(booking);
  }

  async rescheduleBooking(
    bookingId: string,
    userId: string,
    items: BookingItemInput[],
    reason?: string,
    role?: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const stylistId =
      role === UserRole.STYLIST ? await resolveStylistId(userId, this.slotRepo) : undefined;

    if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    this.bookingValidator.validateLeadTime(booking.startTime, booking.date);

    const branchId = booking.branchId?.toString() || BOOKING_DEFAULTS.BRANCH_ID;
    const bookingItems = await this.prepareBookingItems(branchId, items);

    booking.items = bookingItems;
    booking.date = bookingItems[0].date;
    booking.startTime = bookingItems[0].startTime;
    booking.endTime = bookingItems[bookingItems.length - 1].endTime;
    booking.rescheduleCount = (booking.rescheduleCount || 0) + 1;
    booking.rescheduleReason = reason;
    await this.bookingRepo.update({ _id: toObjectId(bookingId) }, booking);

    return BookingMapper.toResponse(booking);
  }

  async updateBookingStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus,
    role: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const stylistId =
      role === UserRole.STYLIST ? await resolveStylistId(userId, this.slotRepo) : undefined;

    if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    this.bookingValidator.validateStatusTransition(booking, status, role as UserRole);

    booking.status = status;
    await this.bookingRepo.update({ _id: toObjectId(bookingId) }, booking);

    return BookingMapper.toResponse(booking);
  }

  // ─── Query delegation ──────────────────────────────────────────────────────

  async getBookingDetails(bookingId: string): Promise<BookingResponseDto> {
    return this.bookingQueryService.getBookingDetails(bookingId);
  }

  async listUserBookings(userId: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.listUserBookings(userId);
  }

  async listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.listAllBookings(branchId, date);
  }

  async listStylistBookings(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    return this.bookingQueryService.listStylistBookings(userId, query);
  }

  async getTodayBookings(branchId?: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.getTodayBookings(branchId);
  }

  async getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.getStylistTodayBookings(userId);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async prepareBookingItems(
    branchId: string,
    items: BookingItemInput[],
  ): Promise<IBookingItem[]> {
    const bookingItems: IBookingItem[] = [];

    for (const item of items) {
      const stylistId = await resolveStylistId(item.stylistId, this.slotRepo);

      const branchService = await this.slotRepo.findBranchService(branchId, item.serviceId);
      const duration = branchService?.duration ?? BOOKING_DEFAULTS.DURATION;
      const price = branchService?.price ?? BOOKING_DEFAULTS.PRICE;

      const isAvailable = await this.slotService.validateSlot(
        branchId,
        stylistId,
        new Date(item.date),
        item.startTime,
        duration,
      );

      if (!isAvailable) {
        throw new AppError(
          BOOKING_MESSAGES.SLOT_UNAVAILABLE_AT(item.startTime),
          HttpStatus.CONFLICT,
        );
      }

      const endTime = minutesToTime(timeToMinutes(item.startTime) + duration);

      bookingItems.push({
        serviceId: toObjectId(item.serviceId),
        stylistId: toObjectId(stylistId),
        date: new Date(item.date),
        startTime: item.startTime,
        endTime,
        price,
        duration,
      });
    }

    return bookingItems;
  }
}
