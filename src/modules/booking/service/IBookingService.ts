import { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingStatus } from '../../../models/booking.model';
import { BookingItemInput } from '../dto/booking.request.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

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
  rescheduleBooking(
    bookingId: string,
    userId: string,
    items: BookingItemInput[],
    reason?: string,
    role?: string,
  ): Promise<BookingResponseDto>;

  updateBookingStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus,
    role: string,
  ): Promise<BookingResponseDto>;
  getBookingDetails(bookingId: string): Promise<BookingResponseDto>;
  listUserBookings(userId: string): Promise<BookingResponseDto[]>;
  listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]>;
  listStylistBookings(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>>;
  getTodayBookings(branchId?: string): Promise<BookingResponseDto[]>;
  getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]>;
}
