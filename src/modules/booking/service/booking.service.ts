import { ExtendBookingDto } from '../dto/booking.request.dto';
import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingMapper } from '../mapper/booking.mapper';
import { IBookingService } from './IBookingService';
import { IBookingRepository } from '../repository/IBookingRepository';
import { injectable, inject } from 'tsyringe';
import { ISlotService } from '../../slot/service/ISlotService';
import { TOKENS } from '../../../common/di/tokens';
import { toObjectId } from '../../../common/utils/mongoose.util';
import mongoose from 'mongoose';
import { AppError } from '../../../common/errors/appError';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BranchServiceModel } from '../../../models/branchService.model';
import {
  BookingStatus,
  PaymentStatus,
  IBookingItem,
  IBooking,
} from '../../../models/booking.model';
import { StylistModel } from '../../../models/stylist.model';
import { SpecialSlotModel, SpecialSlotStatus } from '../../../models/specialSlot.model';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.SlotService)
    private readonly slotService: ISlotService,
  ) {}

  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    const stylistByUserId = await StylistModel.findOne({ userId: userIdOrStylistId })
      .select('_id')
      .lean();
    if (stylistByUserId && stylistByUserId._id) {
      return stylistByUserId._id.toString();
    }
    return userIdOrStylistId;
  }

  async createBooking(
    userId: string,
    slotId: string | undefined,
    items: Array<{
      serviceId: string;
      stylistId: string;
      date: string;
      startTime: string;
      slotId: string;
    }>,
    notes?: string,
  ): Promise<BookingResponseDto> {
    const client = mongoose.connection.getClient();
    const isReplicaSet =
      !!mongoose.connection.get('replicaSet') ||
      (client as unknown as { topology?: { description?: { type?: string } } }).topology
        ?.description?.type === 'ReplicaSetWithPrimary';
    const session = isReplicaSet ? await mongoose.startSession() : null;

    if (session) {
      session.startTransaction();
    }

    try {
      if (!items || items.length === 0) {
        throw new AppError(BOOKING_MESSAGES.NO_SERVICES, HttpStatus.BAD_REQUEST);
      }

      // 1. Resolve Branch & Slot Info
      const firstSlotId = items[0].slotId;
      let branchId: mongoose.Types.ObjectId;

      if (firstSlotId.startsWith('special_')) {
        const specialSlotId = firstSlotId.split('_')[1];
        const specialSlot = await SpecialSlotModel.findById(specialSlotId).session(session || null);
        if (!specialSlot || specialSlot.status !== SpecialSlotStatus.AVAILABLE) {
          throw new AppError(
            BOOKING_MESSAGES.SLOT_UNAVAILABLE('Special Slot'),
            HttpStatus.BAD_REQUEST,
          );
        }
        branchId = specialSlot.branchId;
      } else {
        const firstItemSlotParts = firstSlotId.split('_');
        branchId = toObjectId(firstItemSlotParts[1]);
      }

      // 2. Resolve & Validate items
      const { bookingItems } = await this.validateAndPrepareBookingItems(
        branchId.toString(),
        items,
      );
      // 3. Aggregate top-level booking info
      const totalPrice = bookingItems.reduce((sum, i) => sum + i.price, 0);
      const sortedItems = [...bookingItems].sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime();
        return a.startTime.localeCompare(b.startTime);
      });

      const firstItem = sortedItems[0];
      const lastItem = sortedItems[sortedItems.length - 1];

      const isSpecialSlot = items[0].slotId.startsWith('special_');

      const bookingData: Partial<IBooking> = {
        userId: toObjectId(userId),
        branchId,
        items: bookingItems,
        stylistId: firstItem.stylistId,
        date: firstItem.date,
        startTime: firstItem.startTime,
        endTime: lastItem.endTime,
        totalPrice,
        status: isSpecialSlot ? BookingStatus.SPECIAL : BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        notes,
      };

      try {
        const booking = await this.bookingRepo.create(bookingData, session || undefined);

        for (const item of items) {
          if (item.slotId.startsWith('special_')) {
            const ssId = item.slotId.split('_')[1];
            await SpecialSlotModel.findByIdAndUpdate(
              ssId,
              { status: SpecialSlotStatus.BOOKED, bookingId: (booking as IBooking)._id },
              { session: session || undefined },
            );
          }
        }

        if (session) {
          await session.commitTransaction();
        }
        return BookingMapper.toResponse(booking);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
          throw new AppError(BOOKING_MESSAGES.ALREADY_BOOKED, HttpStatus.BAD_REQUEST);
        }
        throw error;
      }
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<BookingResponseDto> {
    const client = mongoose.connection.getClient();
    const isReplicaSet =
      !!mongoose.connection.get('replicaSet') ||
      (client as unknown as { topology?: { description?: { type?: string } } }).topology
        ?.description?.type === 'ReplicaSetWithPrimary';
    const session = isReplicaSet ? await mongoose.startSession() : null;

    if (session) {
      session.startTransaction();
    }

    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (booking.userId.toString() !== userId) {
        throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED_CANCEL, HttpStatus.FORBIDDEN);
      }

      // 1. Validation: 12-hour lead time check
      const bookingDate = new Date(booking.date);
      const [hrs, mins] = booking.startTime.split(':').map(Number);
      bookingDate.setHours(hrs, mins, 0, 0);

      const now = new Date();
      const twelveHoursInMs = 12 * 60 * 60 * 1000;

      if (bookingDate.getTime() - now.getTime() < twelveHoursInMs) {
        throw new AppError(BOOKING_MESSAGES.CANCEL_LEAD_TIME, HttpStatus.BAD_REQUEST);
      }

      // 2. Update booking status
      const updatedBooking = await this.bookingRepo.update(
        bookingId,
        {
          status: BookingStatus.CANCELLED,
          cancelledBy: 'USER',
          cancelledReason: reason,
          cancelledAt: new Date(),
        },
        session || undefined,
      );

      if (!updatedBooking) {
        throw new AppError(BOOKING_MESSAGES.CANCEL_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (session) {
        await session.commitTransaction();
      }
      return BookingMapper.toResponse(updatedBooking);
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  async getBookingDetails(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return BookingMapper.toResponse(booking);
  }

  async listUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepo.find({
      userId,
      status: { $ne: BookingStatus.BLOCKED },
    });
    return bookings.map((booking) => BookingMapper.toResponse(booking));
  }

  async extendBooking(bookingId: string, data: ExtendBookingDto): Promise<BookingResponseDto> {
    const { additionalDuration, reason, newService } = data;
    const client = mongoose.connection.getClient();
    const isReplicaSet =
      !!mongoose.connection.get('replicaSet') ||
      (client as unknown as { topology?: { description?: { type?: string } } }).topology
        ?.description?.type === 'ReplicaSetWithPrimary';
    const session = isReplicaSet ? await mongoose.startSession() : null;

    if (session) {
      session.startTransaction();
    }

    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new AppError(BOOKING_MESSAGES.EXTEND_CONFIRMED_ONLY, HttpStatus.BAD_REQUEST);
      }

      // 1. Calculate new end time based on 15m Grid
      const { SLOT_GRID_SIZE } = await import('../../slot/constants/slot.constants');

      let extraMinutes = 0;
      let newBookingItem: IBookingItem | null = null;

      if (newService) {
        // If adding a new service, validate and prepare it
        const { bookingItems } = await this.validateAndPrepareBookingItems(
          booking.branchId.toString(),
          [newService],
        );
        newBookingItem = bookingItems[0];
        extraMinutes = newBookingItem.duration;
      } else if (additionalDuration) {
        const blocksNeeded = Math.ceil(additionalDuration / SLOT_GRID_SIZE);
        extraMinutes = blocksNeeded * SLOT_GRID_SIZE;
      }

      if (extraMinutes === 0) {
        throw new AppError(BOOKING_MESSAGES.EXTEND_DURATION_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const [hrs, mins] = booking.endTime.split(':').map(Number);
      const currentEndTotalMinutes = hrs * 60 + mins;
      const newEndTotalMinutes = currentEndTotalMinutes + extraMinutes;

      const newEndHrs = Math.floor(newEndTotalMinutes / 60);
      const newEndMins = newEndTotalMinutes % 60;
      const newEndTimeStr = `${newEndHrs.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;

      const resolvedStylistId = await this.resolveStylistId(booking.stylistId.toString());
      const isValid = await this.slotService.validateSlot(
        booking.branchId.toString(),
        resolvedStylistId,
        booking.date,
        booking.endTime,
        extraMinutes,
      );

      if (!isValid) {
        throw new AppError(BOOKING_MESSAGES.EXTEND_UNAVAILABLE, HttpStatus.BAD_REQUEST);
      }

      const updateData: mongoose.UpdateQuery<IBooking> = {
        endTime: newEndTimeStr,
        extensionReason: reason,
      };

      if (newBookingItem) {
        updateData.$push = { items: newBookingItem };
        updateData.$inc = { totalPrice: newBookingItem.price };
      }

      const updatedBooking = await this.bookingRepo.update(
        bookingId,
        updateData,
        session || undefined,
      );

      if (!updatedBooking) {
        throw new AppError(BOOKING_MESSAGES.EXTEND_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (session) {
        await session.commitTransaction();
      }
      return BookingMapper.toResponse(updatedBooking);
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  async listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]> {
    const filter: Record<string, unknown> = {
      status: { $ne: BookingStatus.BLOCKED },
    };
    if (branchId) filter.branchId = branchId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }
    const bookings = await this.bookingRepo.find(filter);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }

  async listStylistBookings(userId: string, date?: string): Promise<BookingResponseDto[]> {
    const stylistId = await this.resolveStylistId(userId);
    const filter: Record<string, unknown> = {
      stylistId,
      status: { $ne: BookingStatus.BLOCKED },
    };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }
    const bookings = await this.bookingRepo.find(filter);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }

  async rescheduleBooking(
    bookingId: string,
    userId: string,
    items: Array<{
      serviceId: string;
      stylistId: string;
      date: string;
      startTime: string;
      slotId: string;
    }>,
    reason?: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (booking.userId.toString() !== userId) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_CUSTOMER_ONLY, HttpStatus.FORBIDDEN);
    }

    if (booking.rescheduleCount >= 1) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_ONCE_ONLY, HttpStatus.BAD_REQUEST);
    }

    // 12h rule
    const bookingDate = new Date(booking.date);
    const [hrs, mins] = booking.startTime.split(':').map(Number);
    bookingDate.setHours(hrs, mins, 0, 0);
    const now = new Date();
    if (bookingDate.getTime() - now.getTime() < 12 * 60 * 60 * 1000) {
      throw new AppError(BOOKING_MESSAGES.RESCHEDULE_LEAD_TIME, HttpStatus.BAD_REQUEST);
    }

    const client = mongoose.connection.getClient();
    const isReplicaSet =
      !!mongoose.connection.get('replicaSet') ||
      (client as unknown as { topology?: { description?: { type?: string } } }).topology
        ?.description?.type === 'ReplicaSetWithPrimary';
    const session = isReplicaSet ? await mongoose.startSession() : null;

    if (session) {
      session.startTransaction();
    }

    try {
      const branchId = booking.branchId;
      const { bookingItems } = await this.validateAndPrepareBookingItems(
        branchId.toString(),
        items,
      );

      // Sort by time
      bookingItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const firstItem = bookingItems[0];
      const lastItem = bookingItems[bookingItems.length - 1];
      const totalPrice = bookingItems.reduce((sum, item) => sum + item.price, 0);

      const updatedBooking = await this.bookingRepo.update(
        bookingId,
        {
          items: bookingItems,
          stylistId: firstItem.stylistId,
          date: firstItem.date,
          startTime: firstItem.startTime,
          endTime: lastItem.endTime,
          totalPrice,
          rescheduleCount: booking.rescheduleCount + 1,
          rescheduleReason: reason,
          notes: booking.notes,
        },
        session || undefined,
      );

      if (!updatedBooking)
        throw new AppError(BOOKING_MESSAGES.RESCHEDULE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);

      if (session) {
        await session.commitTransaction();
      }
      return BookingMapper.toResponse(updatedBooking);
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  async getTodayBookings(branchId?: string): Promise<BookingResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter: Record<string, unknown> = {
      date: { $gte: today, $lt: tomorrow },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
    };
    if (branchId) filter.branchId = toObjectId(branchId);

    const bookings = await this.bookingRepo.find(filter);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }

  async getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]> {
    const resolvedStylistId = await this.resolveStylistId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await this.bookingRepo.find({
      stylistId: toObjectId(resolvedStylistId),
      date: { $gte: today, $lt: tomorrow },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.SPECIAL] },
    });
    return bookings.map((b) => BookingMapper.toResponse(b));
  }

  async updateBookingStatus(
    bookingId: string,
    actorId: string,
    status: BookingStatus,
    role: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);

    const allowedTransitions: Record<string, BookingStatus[]> = {
      [BookingStatus.CONFIRMED]: [
        BookingStatus.IN_PROGRESS,
        BookingStatus.NO_SHOW,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.NO_SHOW],
    };

    const allowed = allowedTransitions[booking.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(
        `Cannot change status from ${booking.status} to ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === BookingStatus.CANCELLED) {
      updateData.cancelledBy = role === 'ADMIN' ? 'ADMIN' : 'STYLIST';
      updateData.cancelledAt = new Date();
    }

    const updated = await this.bookingRepo.update(bookingId, updateData);
    if (!updated) throw new AppError(BOOKING_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return BookingMapper.toResponse(updated);
  }

  private async validateAndPrepareBookingItems(
    branchId: string,
    items: Array<{
      serviceId: string;
      stylistId: string;
      date: string;
      startTime: string;
      slotId: string;
    }>,
  ): Promise<{ bookingItems: IBookingItem[] }> {
    const { SLOT_GRID_SIZE } = await import('../../slot/constants/slot.constants');

    const serviceIds = items.map((i) => i.serviceId);
    const branchServices = await BranchServiceModel.find({
      branchId: toObjectId(branchId),
      serviceId: { $in: serviceIds },
      isActive: true,
    }).lean();

    if (branchServices.length !== items.length) {
      throw new AppError(BOOKING_MESSAGES.SERVICES_NOT_AVAILABLE, HttpStatus.BAD_REQUEST);
    }

    const serviceMap = new Map(branchServices.map((s) => [s.serviceId.toString(), s]));
    const bookingItems: IBookingItem[] = [];

    for (const item of items) {
      const s = serviceMap.get(item.serviceId);
      if (!s)
        throw new AppError(
          BOOKING_MESSAGES.SERVICE_NOT_FOUND(item.serviceId),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const resolvedStylistId = await this.resolveStylistId(item.stylistId);
      const itemDate = new Date(item.date);

      // Validate individual slot
      const isValid = await this.slotService.validateSlot(
        branchId,
        resolvedStylistId,
        itemDate,
        item.startTime,
        s.duration,
      );

      if (!isValid) {
        throw new AppError(
          BOOKING_MESSAGES.SLOT_UNAVAILABLE(s.serviceId.toString()),
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate endTime
      const blocksNeeded = Math.ceil(s.duration / SLOT_GRID_SIZE);
      const [ihrs, imins] = item.startTime.split(':').map(Number);
      const startTM = ihrs * 60 + imins;
      const endTM = startTM + blocksNeeded * SLOT_GRID_SIZE;
      const itemEndTime = `${Math.floor(endTM / 60)
        .toString()
        .padStart(2, '0')}:${(endTM % 60).toString().padStart(2, '0')}`;

      bookingItems.push({
        serviceId: toObjectId(item.serviceId),
        stylistId: toObjectId(resolvedStylistId),
        price: s.price,
        duration: s.duration,
        date: itemDate,
        startTime: item.startTime,
        endTime: itemEndTime,
      });
    }

    return { bookingItems };
  }
}
