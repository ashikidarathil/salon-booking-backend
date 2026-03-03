import { injectable } from 'tsyringe';
import { IBookingValidator } from './IBookingValidator';
import { IBooking } from '../../../models/booking.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { BOOKING_POLICY, TIME_UTILS } from '../constants/booking.constants';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BookingStatus } from '../../../models/booking.model';
import { SALOON_TIMEZONE_OFFSET } from '../../../common/constants/app.constants';

@injectable()
export class BookingValidator implements IBookingValidator {
  validateStatusTransition(booking: IBooking, newStatus: BookingStatus, role: UserRole): void {
    const currentStatus = booking.status;
    if (currentStatus === BookingStatus.CANCELLED) {
      throw new AppError(BOOKING_MESSAGES.MODIFIED_CANCELLED, HttpStatus.CONFLICT);
    }

    if (role === UserRole.USER && newStatus !== BookingStatus.CANCELLED) {
      throw new AppError(BOOKING_MESSAGES.STATUS_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    if (role === UserRole.STYLIST) {
      const allowedStylistStatuses = [
        BookingStatus.IN_PROGRESS,
        BookingStatus.NO_SHOW,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ];

      if (!allowedStylistStatuses.includes(newStatus)) {
        throw new AppError(BOOKING_MESSAGES.STATUS_FORBIDDEN_STYLIST, HttpStatus.FORBIDDEN);
      }

      const now = new Date();
      const saloonNow = new Date(now.getTime() + SALOON_TIMEZONE_OFFSET * 60000);
      const nowDayStr = saloonNow.toISOString().split('T')[0];

      const bookingDayStr = (booking.date instanceof Date ? booking.date : new Date(booking.date))
        .toISOString()
        .split('T')[0];

      if (nowDayStr !== bookingDayStr) {
        throw new AppError(BOOKING_MESSAGES.WRONG_DAY_FOR_STATUS, HttpStatus.BAD_REQUEST);
      }

      const bookingStart = new Date(booking.date);
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      bookingStart.setHours(hours, minutes, 0, 0);

      if (now < bookingStart) {
        throw new AppError(BOOKING_MESSAGES.TOO_EARLY_FOR_STATUS, HttpStatus.BAD_REQUEST);
      }
    }
  }

  validateLeadTime(startTime: string, date: Date | string): void {
    const bookingDate = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);

    const leadTimeMs = bookingDate.getTime() - Date.now();
    const leadTimeHours = leadTimeMs / TIME_UTILS.MS_PER_HOUR;

    if (leadTimeHours < BOOKING_POLICY.MIN_LEAD_TIME_HOURS) {
      throw new AppError(BOOKING_MESSAGES.LEAD_TIME_VIOLATION, HttpStatus.CONFLICT);
    }
  }

  isAuthorizedToModify(
    booking: IBooking,
    userId: string,
    role?: string,
    stylistId?: string,
  ): boolean {
    if (role === UserRole.ADMIN) return true;

    const bookingUserId = resolveId(booking.userId);
    if (bookingUserId === userId) return true;

    if (role === UserRole.STYLIST && stylistId) {
      return resolveId(booking.stylistId) === stylistId;
    }

    return false;
  }
}

function resolveId(field: unknown): string {
  if (field && typeof field === 'object' && '_id' in field) {
    return (field as { _id: { toString(): string } })._id.toString();
  }
  return (field as { toString(): string })?.toString() ?? '';
}
