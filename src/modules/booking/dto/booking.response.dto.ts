import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

export interface BookingResponseDto {
  id: string;
  userId: string;
  branchId: string;
  slotId?: string;
  serviceId: string;
  stylistId: string;
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
  createdAt: string;
  updatedAt: string;
}
