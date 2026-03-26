import { BookingStatus } from '../../../models/booking.model';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BookingEntity } from '../../../common/types/bookingEntity';

export interface IBookingValidator {
  validateStatusTransition(booking: BookingEntity, newStatus: BookingStatus, role: UserRole): void;
  validateLeadTime(startTime: string, date: Date | string): void;
  isAuthorizedToModify(
    booking: BookingEntity,
    userId: string,
    role?: string,
    stylistId?: string,
  ): boolean;
}
