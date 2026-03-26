import { BookingItemInput, StylistBookingPaginationQueryDto } from '../dto/booking.request.dto';
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
import { BOOKING_DEFAULTS, TIME_UTILS } from '../constants/booking.constants';
import { SLOT_PREFIXES } from '../../slot/constants/slot.constants';
import { BookingStatus, IBookingItem, PaymentStatus } from '../../../models/booking.model';
import { IBookingValidator } from './IBookingValidator';
import { IBookingQueryService } from './IBookingQueryService';
import { ISlotRepository } from '../../slot/repository/ISlotRepository';
import { toObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { ICouponService } from '../../coupon/service/ICouponService';
import { DiscountType } from '../../../models/coupon.model';
import { resolveStylistId, timeToMinutes, minutesToTime } from './booking.helpers';
import { UserRole } from '../../../common/enums/userRole.enum';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { IWalletService } from '../../wallet/service/IWalletService';
import { IEscrowService } from '../../escrow/service/IEscrowService';
import { INotificationService } from '../../notification/service/INotificationService';
import { NotificationType } from '../../../models/notification.model';
import { UpdateQuery } from 'mongoose';
import { BookingRef } from '../../../common/types/bookingEntity';

const ADVANCE_PERCENTAGE = 0.2; // 20% advance
const PAYMENT_WINDOW_MINUTES = 15;

@injectable()
export class BookingService implements IBookingService {
  private getRefId(ref: BookingRef): string {
    if (ref && typeof ref === 'object' && '_id' in ref) {
      return ref._id.toString();
    }
    return ref as string;
  }

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
    @inject(TOKENS.CouponService)
    private readonly couponService: ICouponService,
    @inject(TOKENS.WalletService)
    private readonly walletService: IWalletService,
    @inject(TOKENS.EscrowService)
    private readonly escrowService: IEscrowService,
    @inject(TOKENS.NotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async createBooking(
    userId: string,
    items: BookingItemInput[],
    notes?: string,
  ): Promise<BookingResponseDto> {
    const branchId = items[0].slotId.startsWith(SLOT_PREFIXES.DYNAMIC)
      ? items[0].slotId.split('_')[1]
      : BOOKING_DEFAULTS.BRANCH_ID;

    const bookingItems = await this.prepareBookingItems(branchId, items);
    const totalPrice = bookingItems.reduce(
      (sum: number, item: IBookingItem) => sum + item.price,
      0,
    );
    const payableAmount = totalPrice;
    const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);

    const bookingId = new ObjectId();
    const bookingNumber = `BK-${bookingId.toString().slice(-6).toUpperCase()}`;

    const booking = await this.bookingRepo.create({
      _id: bookingId,
      bookingNumber,
      userId: toObjectId(userId),
      branchId: toObjectId(branchId),
      items: bookingItems,
      stylistId: bookingItems[0].stylistId,
      date: bookingItems[0].date,
      startTime: bookingItems[0].startTime,
      endTime: bookingItems[bookingItems.length - 1].endTime,
      totalPrice,
      payableAmount,
      advanceAmount,
      discountAmount: 0,
      status: BookingStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
      paymentWindowExpiresAt: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000),
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

    if (role !== UserRole.ADMIN) {
      this.bookingValidator.validateLeadTime(booking.startTime, booking.date);
    }

    const bookingUserId = booking.userId;

    if (booking.paymentStatus === PaymentStatus.ADVANCE_PAID) {
      const bookingNumber = booking.id.slice(-6).toUpperCase();
      await this.walletService.creditBalance(
        this.getRefId(bookingUserId),
        booking.advanceAmount,
        `Refund for cancelled booking #BK-${bookingNumber}`,
        bookingId,
        'REFUND',
      );
    }

    const updatePaymentStatus =
      booking.paymentStatus === PaymentStatus.ADVANCE_PAID
        ? PaymentStatus.REFUNDED
        : booking.paymentStatus;

    const cancelledBy =
      role === UserRole.ADMIN
        ? 'ADMIN'
        : role === UserRole.STYLIST
          ? 'STYLIST'
          : role === UserRole.USER
            ? 'USER'
            : 'SYSTEM';

    const updated = await this.bookingRepo.update(
      {
        _id: toObjectId(bookingId),
      },
      {
        status: BookingStatus.CANCELLED,
        cancelledBy,
        cancelledReason: reason,
        cancelledAt: new Date(),
        paymentStatus: updatePaymentStatus,
      },
    );

    if (!updated) {
      throw new AppError(BOOKING_MESSAGES.CANCEL_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const recipientId = this.getRefId(role === UserRole.USER ? booking.stylistId : booking.userId);

    this.notificationService
      .createNotification({
        recipientId,
        type: NotificationType.BOOKING_CANCELLED,
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} has been cancelled${reason ? `: ${reason}` : ''}.`,
        link: role === UserRole.USER ? `/stylist/appointments` : `/profile/bookings/${booking.id}`,
      })
      .catch((err) => console.error('Failed to create cancellation notification:', err));

    return BookingMapper.toResponse(updated);
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

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        BOOKING_MESSAGES.ONLY_CONFIRMED_BOOKING_RESCHEDULE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (booking.paymentStatus !== PaymentStatus.ADVANCE_PAID) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_ADVANCE_PAYMENT, HttpStatus.BAD_REQUEST);
    }

    if ((booking.rescheduleCount ?? 0) >= 1) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_ONCE_ONLY, HttpStatus.BAD_REQUEST);
    }

    const bookingStartMs = booking.date.getTime();
    const [h, m] = booking.startTime.split(':').map(Number);
    const bookingStartTime = new Date(bookingStartMs);
    bookingStartTime.setHours(h, m, 0, 0);

    const leadTimeMs = bookingStartTime.getTime() - Date.now();
    const leadTimeHours = leadTimeMs / TIME_UTILS.MS_PER_HOUR;

    if (leadTimeHours < 24) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_LEAD_TIME_24, HttpStatus.CONFLICT);
    }

    const branchId = booking.branchId || BOOKING_DEFAULTS.BRANCH_ID;
    const bookingItems = await this.prepareBookingItems(branchId, items);

    const updated = await this.bookingRepo.update(
      { _id: toObjectId(bookingId) },
      {
        items: bookingItems,
        date: bookingItems[0].date,
        startTime: bookingItems[0].startTime,
        endTime: bookingItems[bookingItems.length - 1].endTime,
        rescheduleCount: (booking.rescheduleCount || 0) + 1,
        rescheduleReason: reason,
      },
    );

    if (!updated) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_FAILED_24, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const stylistUserId = booking.stylistId;

    this.notificationService
      .createNotification({
        recipientId: this.getRefId(stylistUserId),
        type: NotificationType.SYSTEM,
        title: 'Booking Rescheduled',
        message: `Booking #${
          booking.bookingNumber
        } has been rescheduled to ${booking.date.toLocaleDateString()} at ${booking.startTime}.`,
        link: `/stylist/appointments`,
      })
      .catch((err) => console.error('Failed to create reschedule notification:', err));

    return BookingMapper.toResponse(updated);
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

    const updateData: Record<string, unknown> = { status };

    if (status === BookingStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    if (status === BookingStatus.NO_SHOW) {
      if (booking.paymentStatus === PaymentStatus.ADVANCE_PAID) {
        const stylistRawId = this.getRefId(booking.stylistId);
        await this.escrowService.holdAmount(bookingId, stylistRawId, booking.advanceAmount);
      }
    }

    const updated = await this.bookingRepo.update(
      { _id: toObjectId(bookingId) },
      updateData as UpdateQuery<unknown>,
    );

    if (!updated) {
      throw new AppError(BOOKING_MESSAGES.FAILED_TO_UPDATE, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (status === BookingStatus.COMPLETED || status === BookingStatus.NO_SHOW) {
      const isCompleted = status === BookingStatus.COMPLETED;
      this.notificationService
        .createNotification({
          recipientId: this.getRefId(booking.userId),
          type: isCompleted ? NotificationType.BOOKING_COMPLETED : NotificationType.SYSTEM,
          title: isCompleted ? 'Share Your Experience!' : 'Booking Status Updated',
          message: isCompleted
            ? `Your booking #${booking.bookingNumber} is complete! Please take a moment to rate your stylist and service.`
            : `Your booking #${booking.bookingNumber} is now marked as ${status.toLowerCase()}.`,
          link: `/profile/bookings/${booking.id}`,
        })
        .catch((err) => console.error('Failed to create status update notification:', err));
    }

    return BookingMapper.toResponse(updated);
  }

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
    query: StylistBookingPaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    return this.bookingQueryService.listStylistBookings(userId, query);
  }

  async getTodayBookings(branchId?: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.getTodayBookings(branchId);
  }

  async getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]> {
    return this.bookingQueryService.getStylistTodayBookings(userId);
  }

  async getStylistStats(
    userId: string,
    period?: string,
    date?: string,
  ): Promise<Record<string, unknown>> {
    return this.bookingQueryService.getStylistStats(userId, period, date);
  }

  async applyCoupon(
    bookingId: string,
    couponCode: string,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (booking.userId !== userId) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new AppError(BOOKING_MESSAGES.COUPON_PENDING_BOOKING, HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponService.validateCoupon(couponCode, booking.totalPrice);

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (booking.totalPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const payableAmount = Math.max(0, booking.totalPrice - discountAmount);
    const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);
    const couponObjectId = toObjectId(coupon.id);

    const updated = await this.bookingRepo.update(
      { _id: toObjectId(bookingId) },
      {
        discountAmount,
        payableAmount,
        advanceAmount,
        couponId: couponObjectId as unknown as string,
      },
    );

    if (!updated) {
      throw new AppError(BOOKING_MESSAGES.FAILED_TO_APPLY_COUPON, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return BookingMapper.toResponse(updated);
  }

  async removeCoupon(bookingId: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (booking.userId !== userId) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new AppError(BOOKING_MESSAGES.COUPON_REMOVE_PENDING_BOOKING, HttpStatus.BAD_REQUEST);
    }

    if (!booking.couponId) {
      throw new AppError(BOOKING_MESSAGES.NO_COUPON_APPLIED, HttpStatus.BAD_REQUEST);
    }

    const payableAmount = booking.totalPrice;
    const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);

    const updated = await this.bookingRepo.update({ _id: toObjectId(bookingId) }, {
      $set: {
        discountAmount: 0,
        payableAmount,
        advanceAmount,
      },
      $unset: { couponId: 1 },
    } as UpdateQuery<unknown>);

    if (!updated) {
      throw new AppError(
        BOOKING_MESSAGES.FAILED_TO_REMOVE_COUPON,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return BookingMapper.toResponse(updated);
  }

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
