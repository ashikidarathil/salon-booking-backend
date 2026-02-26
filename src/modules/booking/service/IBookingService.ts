import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingStatus } from '../../../models/booking.model';
import { ExtendBookingDto } from '../dto/booking.request.dto';

export interface BookingItemInput {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  slotId: string;
}

export interface IBookingService {
  createBooking(
    userId: string,
    slotId: string | undefined,
    items: BookingItemInput[],
    notes?: string,
  ): Promise<BookingResponseDto>;
  cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
    role?: string,
  ): Promise<BookingResponseDto>;
  getBookingDetails(bookingId: string): Promise<BookingResponseDto>;
  listUserBookings(userId: string): Promise<BookingResponseDto[]>;
  listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]>;
  listStylistBookings(userId: string, date?: string): Promise<BookingResponseDto[]>;
  getTodayBookings(branchId?: string): Promise<BookingResponseDto[]>;
  getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]>;
  extendBooking(bookingId: string, data: ExtendBookingDto): Promise<BookingResponseDto>;
  rescheduleBooking(
    bookingId: string,
    userId: string,
    items: BookingItemInput[],
    reason?: string,
  ): Promise<BookingResponseDto>;
  updateBookingStatus(
    bookingId: string,
    actorId: string,
    status: BookingStatus,
    role: string,
  ): Promise<BookingResponseDto>;
}
