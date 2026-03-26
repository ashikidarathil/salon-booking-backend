import { PaymentResponseDto, OrderResponseDto } from '../dto/payment.response.dto';
import { CreateOrderRequestDto, PaymentVerificationDto } from '../dto/payment.request.dto';

export interface IPaymentService {
  createOrder(dto: CreateOrderRequestDto, userId: string): Promise<OrderResponseDto>;
  verifyPayment(dto: PaymentVerificationDto): Promise<PaymentResponseDto>;
  payWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto>;
  createRemainingOrder(bookingId: string, userId: string): Promise<OrderResponseDto>;
  payRemainingWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto>;
  getPaymentById(id: string): Promise<PaymentResponseDto>;
}
