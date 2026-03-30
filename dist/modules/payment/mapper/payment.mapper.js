"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMapper = void 0;
class PaymentMapper {
    static toResponseDto(payment) {
        return {
            id: payment._id.toString(),
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            bookingId: payment.bookingId?.toString() ?? '',
            userId: payment.userId.toString(),
            createdAt: payment.createdAt.toISOString(),
        };
    }
    static toResponseListDto(payments) {
        return payments.map((p) => this.toResponseDto(p));
    }
}
exports.PaymentMapper = PaymentMapper;
