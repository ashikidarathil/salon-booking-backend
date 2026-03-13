import { IPayment } from '../../../models/payment.model';
import { PaymentResponseDto } from '../dto/payment.response.dto';
import { ObjectId } from '../../../common/utils/mongoose.util';

export class PaymentMapper {
  static toResponseDto(payment: IPayment): PaymentResponseDto {
    return {
      id: (payment._id as ObjectId).toString(),
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      bookingId: payment.bookingId?.toString() ?? '',
      userId: (payment.userId as ObjectId).toString(),
      createdAt: payment.createdAt.toISOString(),
    };
  }

  static toResponseListDto(payments: IPayment[]): PaymentResponseDto[] {
    return payments.map((p) => this.toResponseDto(p));
  }
}
