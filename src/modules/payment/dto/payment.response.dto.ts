import { PaymentStatus } from '../../../models/payment.model';

export interface OrderResponseDto {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bookingId: string;
  userId: string;
  createdAt: string;
}
