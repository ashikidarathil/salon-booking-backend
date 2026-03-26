import { BookingStatus, PaymentStatus } from '../../models/booking.model';

export type BookingRef = string | { _id: string | { toString(): string } };

export interface PopulatedUserRef {
  _id: string | { toString(): string };
  name: string;
  email?: string;
  phone?: string;
}

export interface PopulatedStylistRef {
  _id: string | { toString(): string };
  profilePicture?: string;
  userId: PopulatedUserRef;
}

export interface PopulatedServiceRef {
  _id: string | { toString(): string };
  name: string;
  imageUrl?: string;
}

export interface BookingItemEntity {
  serviceId: string | PopulatedServiceRef;
  stylistId: string | PopulatedStylistRef;
  price: number;
  duration: number;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface BookingEntity {
  id: string;
  bookingNumber: string;
  userId: string | PopulatedUserRef;
  branchId: string;
  slotId?: string;
  items: BookingItemEntity[];
  stylistId: string | PopulatedStylistRef;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  discountAmount?: number;
  payableAmount: number;
  advanceAmount: number;
  couponId?: string | { toString(): string };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledBy?: 'USER' | 'ADMIN' | 'STYLIST' | 'SYSTEM';
  cancelledReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  rescheduleCount: number;
  rescheduleReason?: string;
  paymentWindowExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
