import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

export interface BookingItemDto {
  serviceId: string;
  serviceName?: string;
  stylistId: string;
  stylistName?: string;
  price: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingResponseDto {
  id: string;
  userId: string;
  userName?: string;
  branchId: string;
  slotId?: string;
  items: BookingItemDto[];
  stylistId: string;
  stylistName?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledBy?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  extensionReason?: string;
  rescheduleCount?: number;
  rescheduleReason?: string;
  createdAt: string;
  updatedAt: string;
}
