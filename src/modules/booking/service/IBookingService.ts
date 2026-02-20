import { BookingResponseDto } from '../dto/booking.response.dto';

export interface IBookingService {
  createBooking(
    userId: string,
    slotId: string,
    serviceId: string,
    notes?: string,
  ): Promise<BookingResponseDto>;
  cancelBooking(bookingId: string, userId: string, reason?: string): Promise<BookingResponseDto>;
  getBookingDetails(bookingId: string): Promise<BookingResponseDto>;
  listUserBookings(userId: string): Promise<BookingResponseDto[]>;
  extendBooking(bookingId: string, additionalDuration: number): Promise<BookingResponseDto>;
}
