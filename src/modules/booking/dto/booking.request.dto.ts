import { BookingStatus } from '../../../models/booking.model';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface BookingItemInput {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  slotId: string;
}

export interface CreateBookingDto {
  items: BookingItemInput[];
  notes?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface RescheduleBookingDto {
  items: BookingItemInput[];
  reason?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface StylistBookingPaginationQueryDto extends PaginationQueryDto {
  date?: string;
}
