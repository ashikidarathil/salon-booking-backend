import {
  PaymentResponseDto,
  CreateOrderRequestDto,
  PaymentVerificationDto,
  OrderResponseDto,
} from '../dto/payment.dto';

// Fix: accidentally used coupon.dto in writing thought, correcting to payment.dto
export interface IPaymentService {
  createOrder(dto: CreateOrderRequestDto, userId: string): Promise<OrderResponseDto>;
  verifyPayment(dto: PaymentVerificationDto): Promise<PaymentResponseDto>;
  payWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto>;
  createRemainingOrder(bookingId: string, userId: string): Promise<OrderResponseDto>;
  payRemainingWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto>;
  getPaymentById(id: string): Promise<PaymentResponseDto>;
}
