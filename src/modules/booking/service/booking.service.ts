import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingMapper } from '../mapper/booking.mapper';
import { IBookingService } from './IBookingService';
import { IBookingRepository } from '../repository/IBookingRepository';
import { injectable, inject } from 'tsyringe';
import { ISlotService } from '../../slot/service/ISlotService';
import { TOKENS } from '../../../common/di/tokens';
import mongoose from 'mongoose';
import { AppError } from '../../../common/errors/appError';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BranchServiceModel } from '../../../models/branchService.model';
import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.SlotService)
    private readonly slotService: ISlotService,
  ) {}

  async createBooking(
    userId: string,
    slotId: string,
    serviceId: string,
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
      let endTime: string;

      // Dynamic slots are the only slots we support now
      if (!slotId.startsWith('dynamic_')) {
        throw new AppError(
          'Invalid slot selection. Please select a valid available slot.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const parts = slotId.split('_');
      const branchId = new mongoose.Types.ObjectId(parts[1]);
      const stylistId = new mongoose.Types.ObjectId(parts[2]);
      const date = new Date(parts[3]);
      const startTime = parts[4];
      endTime = parts[5];

      // Security: Check Booking Window
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const maxDate = new Date(now);
      maxDate.setUTCDate(now.getUTCDate() + 14); // 14 days

      if (date < now || date > maxDate) {
        throw new AppError(
          'Booking window exceeded. Please select a date within the next 14 days.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Resolve branch service for price calculation
      const branchService = await BranchServiceModel.findOne({
        branchId,
        serviceId: serviceId,
        isActive: true,
      });

      if (!branchService) {
        throw new AppError('Service not available at this branch', HttpStatus.BAD_REQUEST);
      }

      // 3. Server-Side Validation: Ensure the slot is ACTUALLY available on the grid
      const isValid = await this.slotService.validateSlot(
        branchId.toString(),
        stylistId.toString(),
        date,
        startTime,
        branchService.duration,
      );

      if (!isValid) {
        throw new AppError(
          'The selected slot is no longer available. Please select another slot.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. Recalculate endTime based on Grid (15m units)
      // This protects against client-side manipulation of endTime in slotId
      const { SLOT_GRID_SIZE } = await import('../../slot/constants/slot.constants');
      const blocksNeeded = Math.ceil(branchService.duration / SLOT_GRID_SIZE);
      const totalMinutes = blocksNeeded * SLOT_GRID_SIZE;

      const [hrs, mins] = startTime.split(':').map(Number);
      const startTotalMinutes = hrs * 60 + mins;
      const endTotalMinutes = startTotalMinutes + totalMinutes;

      const endHrs = Math.floor(endTotalMinutes / 60);
      const endMins = endTotalMinutes % 60;
      endTime = `${endHrs.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      // 5. Create the booking
      // Atomic check: MongoDB unique index will prevent collision here
      const bookingData = {
        userId: new mongoose.Types.ObjectId(userId),
        branchId,
        serviceId: new mongoose.Types.ObjectId(serviceId),
        stylistId,
        date,
        startTime,
        endTime,
        totalPrice: branchService.price,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        notes,
      };

      try {
        const booking = await this.bookingRepo.create(bookingData, session || undefined);
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

      if (booking.status === BookingStatus.CANCELLED) {
        throw new AppError(BOOKING_MESSAGES.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
      }

      // 1. Update booking status
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
        throw new AppError('Failed to cancel booking', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Legacy slot restoration is removed as we only use dynamic slots + bookings

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
    const bookings = await this.bookingRepo.find({ userId });
    return bookings.map((booking) => BookingMapper.toResponse(booking));
  }

  async extendBooking(bookingId: string, additionalDuration: number): Promise<BookingResponseDto> {
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
        throw new AppError('Only confirmed bookings can be extended', HttpStatus.BAD_REQUEST);
      }

      // 1. Calculate new end time based on 15m Grid
      const { SLOT_GRID_SIZE } = await import('../../slot/constants/slot.constants');
      const blocksNeeded = Math.ceil(additionalDuration / SLOT_GRID_SIZE);
      const extraMinutes = blocksNeeded * SLOT_GRID_SIZE;

      const [hrs, mins] = booking.endTime.split(':').map(Number);
      const currentEndTotalMinutes = hrs * 60 + mins;
      const newEndTotalMinutes = currentEndTotalMinutes + extraMinutes;

      const newEndHrs = Math.floor(newEndTotalMinutes / 60);
      const newEndMins = newEndTotalMinutes % 60;
      const newEndTimeStr = `${newEndHrs.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;

      // 2. Validation: Check if the extra time window is available
      // We check from original endTime to newEndTime
      const isValid = await this.slotService.validateSlot(
        booking.branchId.toString(),
        booking.stylistId.toString(),
        booking.date,
        booking.endTime, // Start checking from where it currently ends
        extraMinutes,
      );

      if (!isValid) {
        throw new AppError(
          'Cannot extend booking: the following time slots are already reserved or unavailable.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Update the booking
      const updatedBooking = await this.bookingRepo.update(
        bookingId,
        { endTime: newEndTimeStr },
        session || undefined,
      );

      if (!updatedBooking) {
        throw new AppError('Failed to extend booking', HttpStatus.INTERNAL_SERVER_ERROR);
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
}
