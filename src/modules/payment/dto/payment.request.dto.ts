export interface CreateOrderRequestDto {
  bookingId: string;
}

export interface PaymentVerificationDto {
  orderId: string;
  paymentId: string;
  signature: string;
}
