import { BookingResponseDto } from '../dto/booking.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IBookingQueryService {
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
