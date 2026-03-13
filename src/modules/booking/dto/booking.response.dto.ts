import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

export interface PopulatedUser {
  _id: { toString(): string };
  name: string;
}

export interface PopulatedStylist {
  _id: { toString(): string };
  profilePicture?: string;
  userId: PopulatedUser;
}

export interface PopulatedService {
  _id: { toString(): string };
  name: string;
  imageUrl?: string;
}

export interface BookingItemDto {
  serviceId: string;
  serviceName: string;
  serviceImageUrl?: string;
  stylistId: string;
  stylistName: string;
  price: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingResponseDto {
  id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  branchId: string;
  slotId?: string;
  items: BookingItemDto[];
  stylistId: string;
  stylistName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  discountAmount: number;
  payableAmount: number;
  advanceAmount: number;
  couponId?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledBy?: 'USER' | 'ADMIN' | 'STYLIST' | 'SYSTEM';
  cancelledReason?: string;
  cancelledAt?: string;
  rescheduleCount?: number;
  rescheduleReason?: string;
  paymentWindowExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
