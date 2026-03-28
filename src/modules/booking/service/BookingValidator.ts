import { injectable } from 'tsyringe';
import { IBookingValidator } from './IBookingValidator';
import { BookingStatus } from '../../../models/booking.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { BOOKING_POLICY, TIME_UTILS } from '../constants/booking.constants';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BookingEntity, BookingRef } from '../../../common/types/bookingEntity';

@injectable()
export class BookingValidator implements IBookingValidator {
  validateStatusTransition(booking: BookingEntity, newStatus: BookingStatus, role: UserRole): void {
    const currentStatus = booking.status;
    if (currentStatus === BookingStatus.CANCELLED) {
      throw new AppError(BOOKING_MESSAGES.MODIFIED_CANCELLED, HttpStatus.CONFLICT);
    }

    if (role === UserRole.USER && newStatus !== BookingStatus.CANCELLED) {
      throw new AppError(BOOKING_MESSAGES.STATUS_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    if (role === UserRole.STYLIST) {
      const allowedStylistStatuses = [
        BookingStatus.NO_SHOW,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ];

      if (!allowedStylistStatuses.includes(newStatus)) {
        throw new AppError(BOOKING_MESSAGES.STATUS_FORBIDDEN_STYLIST, HttpStatus.FORBIDDEN);
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
    booking: BookingEntity,
    userId: string,
    role?: string,
    stylistId?: string,
  ): boolean {
    if (role === UserRole.ADMIN) return true;

    if (this.getRefId(booking.userId) === userId) return true;

    if (role === UserRole.STYLIST && stylistId) {
      return this.getRefId(booking.stylistId) === stylistId;
    }

    return false;
  }

  private getRefId(ref: BookingRef): string {
    if (ref && typeof ref === 'object' && '_id' in ref) {
      return ref._id.toString();
    }
    return ref as string;
  }
}
