import { IBooking, BookingStatus } from '../../../models/booking.model';
import { UserRole } from '../../../common/enums/userRole.enum';

export interface IBookingValidator {
  validateStatusTransition(booking: IBooking, newStatus: BookingStatus, role: UserRole): void;
  validateLeadTime(startTime: string, date: Date | string): void;
  isAuthorizedToModify(
    booking: IBooking,
    userId: string,
    role?: string,
    stylistId?: string,
  ): boolean;
}
