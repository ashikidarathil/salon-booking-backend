import { inject, injectable } from 'tsyringe';
import { IPaymentService } from './IPaymentService';
import { IPaymentRepository } from '../repository/IPaymentRepository';
import { IRazorpayService, RazorpayOrder } from './IRazorpayService';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { PaymentStatus } from '../../../models/payment.model';
import {
  BookingStatus,
  PaymentStatus as BookingPaymentStatus,
} from '../../../models/booking.model';
import {
  PaymentResponseDto,
  OrderResponseDto,
} from '../dto/payment.response.dto';
import {
  CreateOrderRequestDto,
  PaymentVerificationDto,
} from '../dto/payment.request.dto';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PAYMENT_MESSAGES } from '../constants/payment.messages';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { env } from '../../../config/env';
import { toObjectId, isValidObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { IEscrowService } from '../../escrow/service/IEscrowService';
import { IWalletService } from '../../wallet/service/IWalletService';
import { ICouponService } from '../../coupon/service/ICouponService';
import { IChatService } from '../../chat/service/IChatService';
import { INotificationService } from '../../notification/service/INotificationService';
import { NotificationType } from '../../../models/notification.model';
import { ClientSession } from 'mongoose';

const getIdString = (ref: unknown): string => {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref !== null && '_id' in (ref as Record<string, unknown>)) {
    return String((ref as Record<string, unknown>)._id);
  }
  return String(ref);
};

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TOKENS.PaymentRepository)
    private paymentRepository: IPaymentRepository,
    @inject(TOKENS.RazorpayService)
    private razorpayService: IRazorpayService,
    @inject(TOKENS.BookingRepository)
    private bookingRepository: IBookingRepository,
    @inject(TOKENS.EscrowService)
    private escrowService: IEscrowService,
    @inject(TOKENS.WalletService)
    private walletService: IWalletService,
    @inject(TOKENS.CouponService)
    private couponService: ICouponService,
    @inject(TOKENS.ChatService)
    private chatService: IChatService,
    @inject(TOKENS.NotificationService)
    private notificationService: INotificationService,
  ) {}

  /**
   * CREATE ORDER — for advance payment (20%) of a new PENDING_PAYMENT booking.
   */
  async createOrder(dto: CreateOrderRequestDto, userId: string): Promise<OrderResponseDto> {
    if (!isValidObjectId(dto.bookingId)) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const amount =
      booking.paymentStatus === BookingPaymentStatus.ADVANCE_PAID
        ? booking.payableAmount - booking.advanceAmount
        : booking.advanceAmount;

    try {
      const order = (await this.razorpayService.createOrder(
        amount,
        'INR',
        `receipt_${dto.bookingId}`,
      )) as RazorpayOrder;

      await this.paymentRepository.create({
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        bookingId: toObjectId(dto.bookingId),
        userId: toObjectId(userId),
      });

      return {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID,
      };
    } catch (_error) {
      throw new AppError(PAYMENT_MESSAGES.ORDER_CREATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * VERIFY PAYMENT — handles both advance (20%) and remaining (80%) Razorpay payments.
   * Escrow is created ONLY when the remaining payment is made and paymentStatus becomes PAID.
   */
  async verifyPayment(dto: PaymentVerificationDto): Promise<PaymentResponseDto> {
    const isVerified = this.razorpayService.verifySignature(
      dto.orderId,
      dto.paymentId,
      dto.signature,
    );

    if (!isVerified) {
      throw new AppError(PAYMENT_MESSAGES.INVALID_SIGNATURE, HttpStatus.BAD_REQUEST);
    }

    const payment = await this.paymentRepository.findByOrderId(dto.orderId);
    if (!payment) {
      throw new AppError(PAYMENT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return PaymentMapper.toResponseDto(payment);
    }

    const updatedPayment = await this.paymentRepository.update(payment._id.toString(), {
      status: PaymentStatus.COMPLETED,
      paymentId: dto.paymentId,
      signature: dto.signature,
    });

    if (!updatedPayment) {
      throw new AppError(PAYMENT_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (payment.bookingId) {
      const rawBooking = await this.bookingRepository.findById(payment.bookingId.toString());

      if (rawBooking) {
        const isAdvancePayment = rawBooking.paymentStatus === BookingPaymentStatus.PENDING;
        const isRemainingPayment = rawBooking.paymentStatus === BookingPaymentStatus.ADVANCE_PAID;

        const newPaymentStatus = isRemainingPayment
          ? BookingPaymentStatus.PAID
          : BookingPaymentStatus.ADVANCE_PAID;

        const updateData: Record<string, unknown> = { paymentStatus: newPaymentStatus };

        // Advance payment confirms the booking
        if (isAdvancePayment && rawBooking.status === BookingStatus.PENDING_PAYMENT) {
          updateData.status = BookingStatus.CONFIRMED;
          if (rawBooking.couponId) {
            await this.couponService.incrementUsedCount(rawBooking.couponId.toString());
          }
          
          const stylistId = getIdString(rawBooking.stylistId);
          const userId = getIdString(rawBooking.userId);
          await this.chatService.createRoom(rawBooking._id.toString(), userId, stylistId);
          const stylistUserData = rawBooking.stylistId as unknown as { userId: { _id: string | ObjectId } | string | ObjectId };
          const stylistUserId = getIdString(typeof stylistUserData.userId === 'object' ? stylistUserData.userId : stylistUserData.userId);

          this.notificationService
            .createNotification({
              recipientId: stylistUserId,
              type: NotificationType.BOOKING_CONFIRMED,
              title: 'New Booking Confirmed',
              message: `You have a new booking #${
                rawBooking.bookingNumber
              } for ${rawBooking.date.toLocaleDateString()}.`,
              link: `/stylist/appointments`,
            })
            .catch((err) => console.error('Failed to notify stylist of confirmation:', err));
        }

        await this.bookingRepository.update(
          { _id: toObjectId(payment.bookingId.toString()) },
          updateData,
        );

        if (isRemainingPayment) {
          const stylistId = getIdString(rawBooking.stylistId);
          await this.escrowService.holdAmount(
            rawBooking._id.toString(),
            stylistId,
            rawBooking.payableAmount,
          );

          const stylistUserData = rawBooking.stylistId as unknown as { userId: { _id: string | ObjectId } | string | ObjectId };
          const stylistUserId = getIdString(typeof stylistUserData.userId === 'object' ? stylistUserData.userId : stylistUserData.userId);
          
          this.notificationService
            .createNotification({
              recipientId: stylistUserId,
              type: NotificationType.SYSTEM,
              title: 'Payment Received',
              message: `Full payment for booking #${rawBooking.bookingNumber} has been received.`,
              link: `/stylist/appointments`,
            })
            .catch((err) => console.error('Failed to notify stylist of payment:', err));
        }
      }
    }

    return PaymentMapper.toResponseDto(updatedPayment);
  }

  /**
   * PAY WITH WALLET — handles advance (20%) or remaining (80%) via user wallet.
   * Escrow is created ONLY when the remaining payment is made.
   */
  async payWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const bookingUserId = getIdString(booking.userId);
    if (bookingUserId !== userId) {
      throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (booking.paymentStatus === BookingPaymentStatus.PAID) {
      throw new AppError(PAYMENT_MESSAGES.ALREADY_PAID, HttpStatus.BAD_REQUEST);
    }

    const isAdvancePayment = booking.paymentStatus === BookingPaymentStatus.PENDING;
    const isRemainingPayment = booking.paymentStatus === BookingPaymentStatus.ADVANCE_PAID;

    const amount = isRemainingPayment
      ? booking.payableAmount - booking.advanceAmount
      : booking.advanceAmount;

    if (amount <= 0) {
      throw new AppError(PAYMENT_MESSAGES.ALREADY_PAID, HttpStatus.BAD_REQUEST);
    }

    await this.walletService.debitBalance(
      userId,
      amount,
      isRemainingPayment
        ? PAYMENT_MESSAGES.WALLET_REMAINING(bookingId)
        : PAYMENT_MESSAGES.WALLET_ADVANCE(bookingId),
      bookingId,
      'BOOKING',
    );

    const payment = await this.paymentRepository.create({
      orderId: `wallet_${Date.now()}_${bookingId}`,
      amount: amount,
      currency: 'INR',
      status: PaymentStatus.COMPLETED,
      bookingId: toObjectId(bookingId),
      userId: toObjectId(userId),
      paymentId: `wallet_${Date.now()}`,
    });

    const newPaymentStatus = isRemainingPayment
      ? BookingPaymentStatus.PAID
      : BookingPaymentStatus.ADVANCE_PAID;

    const updateData: Record<string, unknown> = { paymentStatus: newPaymentStatus };
    if (isAdvancePayment && booking.status === BookingStatus.PENDING_PAYMENT) {
      updateData.status = BookingStatus.CONFIRMED;
      if (booking.couponId) {
        await this.couponService.incrementUsedCount(booking.couponId.toString());
      }

      const stylistId = getIdString(booking.stylistId);
      const bookingUserIdRaw = getIdString(booking.userId);
      await this.chatService.createRoom(bookingId, bookingUserIdRaw, stylistId);

      const stylistUserData = booking.stylistId as unknown as { userId: { _id: string | ObjectId } | string | ObjectId };
      const stylistUserId = getIdString(typeof stylistUserData.userId === 'object' ? stylistUserData.userId : stylistUserData.userId);
      
      this.notificationService
        .createNotification({
          recipientId: stylistUserId,
          type: NotificationType.BOOKING_CONFIRMED,
          title: 'New Booking Confirmed',
          message: `You have a new booking #${booking.bookingNumber} via Wallet.`,
          link: `/stylist/appointments`,
        })
        .catch((err) => console.error('Failed to notify stylist of confirmation (wallet):', err));
    }


    await this.bookingRepository.update({ _id: toObjectId(bookingId) }, updateData);

    if (isRemainingPayment) {
      const stylistId = getIdString(booking.stylistId);
      await this.escrowService.holdAmount(bookingId, stylistId, booking.payableAmount);
    }

    return PaymentMapper.toResponseDto(payment);
  }

  /**
   * CREATE REMAINING ORDER — separate Razorpay order for the 80% remaining payment.
   * Only applicable when booking is COMPLETED and paymentStatus is ADVANCE_PAID.
   */
  async createRemainingOrder(bookingId: string, userId: string): Promise<OrderResponseDto> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const bookingUserId = getIdString(booking.userId);
    if (bookingUserId !== userId) {
      throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
    if (booking.paymentStatus !== BookingPaymentStatus.ADVANCE_PAID) {
      throw new AppError(PAYMENT_MESSAGES.REMAINING_NOT_APPLICABLE, HttpStatus.BAD_REQUEST);
    }

    const remainingAmount = booking.payableAmount - booking.advanceAmount;

    try {
      const order = (await this.razorpayService.createOrder(
        remainingAmount,
        'INR',
        `remaining_${bookingId}`,
      )) as RazorpayOrder;

      await this.paymentRepository.create({
        orderId: order.id,
        amount: remainingAmount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        bookingId: toObjectId(bookingId),
        userId: toObjectId(userId),
      });

      return {
        orderId: order.id,
        amount: remainingAmount,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID,
      };
    } catch (_error) {
      throw new AppError(PAYMENT_MESSAGES.ORDER_CREATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PAY REMAINING WITH WALLET — pays the 80% remaining via wallet and creates escrow.
   */
  async payRemainingWithWallet(bookingId: string, userId: string): Promise<PaymentResponseDto> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(PAYMENT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const bookingUserId = getIdString(booking.userId);
    if (bookingUserId !== userId) {
      throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
    if (booking.paymentStatus !== BookingPaymentStatus.ADVANCE_PAID) {
      throw new AppError(PAYMENT_MESSAGES.REMAINING_NOT_APPLICABLE, HttpStatus.BAD_REQUEST);
    }

    const remainingAmount = booking.payableAmount - booking.advanceAmount;

    await this.walletService.debitBalance(
      userId,
      remainingAmount,
      PAYMENT_MESSAGES.WALLET_REMAINING(bookingId),
      bookingId,
      'BOOKING',
    );

    const payment = await this.paymentRepository.create({
      orderId: `wallet_remaining_${Date.now()}_${bookingId}`,
      amount: remainingAmount,
      currency: 'INR',
      status: PaymentStatus.COMPLETED,
      bookingId: toObjectId(bookingId),
      userId: toObjectId(userId),
      paymentId: `wallet_remaining_${Date.now()}`,
    });

    await this.bookingRepository.update(
      { _id: toObjectId(bookingId) },
      { paymentStatus: BookingPaymentStatus.PAID },
    );

    const stylistId = getIdString(booking.stylistId);
    await this.escrowService.holdAmount(bookingId, stylistId, booking.payableAmount);

    return PaymentMapper.toResponseDto(payment);
  }

  async getPaymentById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new AppError(PAYMENT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return PaymentMapper.toResponseDto(payment);
  }
}
