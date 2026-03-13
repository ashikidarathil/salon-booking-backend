import { BookingResponseDto } from '../dto/booking.response.dto';
import { StylistBookingPaginationQueryDto } from '../dto/booking.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IBookingQueryService {
  getBookingDetails(bookingId: string): Promise<BookingResponseDto>;
  listUserBookings(userId: string): Promise<BookingResponseDto[]>;
  listAllBookings(branchId?: string, date?: string): Promise<BookingResponseDto[]>;
  listStylistBookings(
    userId: string,
    query: StylistBookingPaginationQueryDto,
  ): Promise<PaginatedResponse<BookingResponseDto>>;
  getTodayBookings(branchId?: string): Promise<BookingResponseDto[]>;
  getStylistTodayBookings(userId: string): Promise<BookingResponseDto[]>;
  getStylistStats(userId: string, period?: string, date?: string): Promise<Record<string, unknown>>;
  checkExpiredBookings(): Promise<number>;
}
