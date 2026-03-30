"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const payment_model_1 = require("../../../models/payment.model");
const booking_model_1 = require("../../../models/booking.model");
const payment_mapper_1 = require("../mapper/payment.mapper");
const payment_messages_1 = require("../constants/payment.messages");
const env_1 = require("../../../config/env");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const notification_model_1 = require("../../../models/notification.model");
const getIdString = (ref) => {
    if (!ref)
        return '';
    if (typeof ref === 'string')
        return ref;
    if (typeof ref === 'object' && ref !== null && '_id' in ref) {
        return String(ref._id);
    }
    return String(ref);
};
let PaymentService = class PaymentService {
    constructor(paymentRepository, razorpayService, bookingRepository, escrowService, walletService, couponService, chatService, notificationService) {
        this.paymentRepository = paymentRepository;
        this.razorpayService = razorpayService;
        this.bookingRepository = bookingRepository;
        this.escrowService = escrowService;
        this.walletService = walletService;
        this.couponService = couponService;
        this.chatService = chatService;
        this.notificationService = notificationService;
    }
    async createOrder(dto, userId) {
        if (!(0, mongoose_util_1.isValidObjectId)(dto.bookingId)) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const booking = await this.bookingRepository.findById(dto.bookingId);
        if (!booking) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const amount = booking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID
            ? booking.payableAmount - booking.advanceAmount
            : booking.advanceAmount;
        try {
            const order = (await this.razorpayService.createOrder(amount, 'INR', `receipt_${dto.bookingId}`));
            await this.paymentRepository.create({
                orderId: order.id,
                amount: amount,
                currency: 'INR',
                status: payment_model_1.PaymentStatus.PENDING,
                bookingId: (0, mongoose_util_1.toObjectId)(dto.bookingId),
                userId: (0, mongoose_util_1.toObjectId)(userId),
            });
            return {
                orderId: order.id,
                amount: amount,
                currency: 'INR',
                keyId: env_1.env.RAZORPAY_KEY_ID,
            };
        }
        catch {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.ORDER_CREATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyPayment(dto) {
        const isVerified = this.razorpayService.verifySignature(dto.orderId, dto.paymentId, dto.signature);
        if (!isVerified) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.INVALID_SIGNATURE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const payment = await this.paymentRepository.findByOrderId(dto.orderId);
        if (!payment) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (payment.status === payment_model_1.PaymentStatus.COMPLETED) {
            return payment_mapper_1.PaymentMapper.toResponseDto(payment);
        }
        const updatedPayment = await this.paymentRepository.update(payment._id.toString(), {
            status: payment_model_1.PaymentStatus.COMPLETED,
            paymentId: dto.paymentId,
            signature: dto.signature,
        });
        if (!updatedPayment) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (payment.bookingId) {
            const rawBooking = await this.bookingRepository.findById(payment.bookingId.toString());
            if (rawBooking) {
                const isAdvancePayment = rawBooking.paymentStatus === booking_model_1.PaymentStatus.PENDING;
                const isRemainingPayment = rawBooking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID;
                const newPaymentStatus = isRemainingPayment
                    ? booking_model_1.PaymentStatus.PAID
                    : booking_model_1.PaymentStatus.ADVANCE_PAID;
                const updateData = { paymentStatus: newPaymentStatus };
                // Advance payment confirms the booking
                if (isAdvancePayment && rawBooking.status === booking_model_1.BookingStatus.PENDING_PAYMENT) {
                    updateData.status = booking_model_1.BookingStatus.CONFIRMED;
                    if (rawBooking.couponId) {
                        await this.couponService.incrementUsedCount(rawBooking.couponId.toString());
                    }
                    const stylistId = getIdString(rawBooking.stylistId);
                    const userId = getIdString(rawBooking.userId);
                    await this.chatService.createRoom(rawBooking.id, userId, stylistId);
                    const stylistUserData = rawBooking.stylistId;
                    const stylistUserId = getIdString(typeof stylistUserData.userId === 'object'
                        ? stylistUserData.userId
                        : stylistUserData.userId);
                    this.notificationService
                        .createNotification({
                        recipientId: stylistUserId,
                        type: notification_model_1.NotificationType.BOOKING_CONFIRMED,
                        title: 'New Booking Confirmed',
                        message: `You have a new booking #${rawBooking.bookingNumber} for ${rawBooking.date.toLocaleDateString()}.`,
                        link: `/stylist/appointments`,
                    })
                        .catch((err) => console.error('Failed to notify stylist of confirmation:', err));
                }
                await this.bookingRepository.update({ _id: (0, mongoose_util_1.toObjectId)(payment.bookingId.toString()) }, updateData);
                if (isRemainingPayment) {
                    const stylistId = getIdString(rawBooking.stylistId);
                    await this.escrowService.holdAmount(rawBooking.id, stylistId, rawBooking.payableAmount);
                    const stylistUserData = rawBooking.stylistId;
                    const stylistUserId = getIdString(typeof stylistUserData.userId === 'object'
                        ? stylistUserData.userId
                        : stylistUserData.userId);
                    this.notificationService
                        .createNotification({
                        recipientId: stylistUserId,
                        type: notification_model_1.NotificationType.SYSTEM,
                        title: 'Payment Received',
                        message: `Full payment for booking #${rawBooking.bookingNumber} has been received.`,
                        link: `/stylist/appointments`,
                    })
                        .catch((err) => console.error('Failed to notify stylist of payment:', err));
                }
            }
        }
        return payment_mapper_1.PaymentMapper.toResponseDto(updatedPayment);
    }
    async payWithWallet(bookingId, userId) {
        if (!(0, mongoose_util_1.isValidObjectId)(bookingId)) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const bookingUserId = getIdString(booking.userId);
        if (bookingUserId !== userId) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.paymentStatus === booking_model_1.PaymentStatus.PAID) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.ALREADY_PAID, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const isAdvancePayment = booking.paymentStatus === booking_model_1.PaymentStatus.PENDING;
        const isRemainingPayment = booking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID;
        const amount = isRemainingPayment
            ? booking.payableAmount - booking.advanceAmount
            : booking.advanceAmount;
        if (amount <= 0) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.ALREADY_PAID, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await this.walletService.debitBalance(userId, amount, isRemainingPayment
            ? payment_messages_1.PAYMENT_MESSAGES.WALLET_REMAINING(booking.bookingNumber)
            : payment_messages_1.PAYMENT_MESSAGES.WALLET_ADVANCE(booking.bookingNumber), bookingId, 'BOOKING');
        const payment = await this.paymentRepository.create({
            orderId: `wallet_${Date.now()}_${bookingId}`,
            amount: amount,
            currency: 'INR',
            status: payment_model_1.PaymentStatus.COMPLETED,
            bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
            userId: (0, mongoose_util_1.toObjectId)(userId),
            paymentId: `wallet_${Date.now()}`,
        });
        const newPaymentStatus = isRemainingPayment
            ? booking_model_1.PaymentStatus.PAID
            : booking_model_1.PaymentStatus.ADVANCE_PAID;
        const updateData = { paymentStatus: newPaymentStatus };
        if (isAdvancePayment && booking.status === booking_model_1.BookingStatus.PENDING_PAYMENT) {
            updateData.status = booking_model_1.BookingStatus.CONFIRMED;
            if (booking.couponId) {
                await this.couponService.incrementUsedCount(booking.couponId.toString());
            }
            const stylistId = getIdString(booking.stylistId);
            const bookingUserIdRaw = getIdString(booking.userId);
            await this.chatService.createRoom(bookingId, bookingUserIdRaw, stylistId);
            const stylistUserData = booking.stylistId;
            const stylistUserId = getIdString(typeof stylistUserData.userId === 'object'
                ? stylistUserData.userId
                : stylistUserData.userId);
            this.notificationService
                .createNotification({
                recipientId: stylistUserId,
                type: notification_model_1.NotificationType.BOOKING_CONFIRMED,
                title: 'New Booking Confirmed',
                message: `You have a new booking #${booking.bookingNumber} via Wallet.`,
                link: `/stylist/appointments`,
            })
                .catch((err) => console.error('Failed to notify stylist of confirmation (wallet):', err));
        }
        await this.bookingRepository.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, updateData);
        if (isRemainingPayment) {
            const stylistId = getIdString(booking.stylistId);
            await this.escrowService.holdAmount(bookingId, stylistId, booking.payableAmount);
        }
        return payment_mapper_1.PaymentMapper.toResponseDto(payment);
    }
    async createRemainingOrder(bookingId, userId) {
        if (!(0, mongoose_util_1.isValidObjectId)(bookingId)) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const bookingUserId = getIdString(booking.userId);
        if (bookingUserId !== userId) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.paymentStatus !== booking_model_1.PaymentStatus.ADVANCE_PAID) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.REMAINING_NOT_APPLICABLE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const remainingAmount = booking.payableAmount - booking.advanceAmount;
        try {
            const order = (await this.razorpayService.createOrder(remainingAmount, 'INR', `remaining_${bookingId}`));
            await this.paymentRepository.create({
                orderId: order.id,
                amount: remainingAmount,
                currency: 'INR',
                status: payment_model_1.PaymentStatus.PENDING,
                bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
                userId: (0, mongoose_util_1.toObjectId)(userId),
            });
            return {
                orderId: order.id,
                amount: remainingAmount,
                currency: 'INR',
                keyId: env_1.env.RAZORPAY_KEY_ID,
            };
        }
        catch {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.ORDER_CREATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async payRemainingWithWallet(bookingId, userId) {
        if (!(0, mongoose_util_1.isValidObjectId)(bookingId)) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const bookingUserId = getIdString(booking.userId);
        if (bookingUserId !== userId) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.paymentStatus !== booking_model_1.PaymentStatus.ADVANCE_PAID) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.REMAINING_NOT_APPLICABLE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const remainingAmount = booking.payableAmount - booking.advanceAmount;
        await this.walletService.debitBalance(userId, remainingAmount, payment_messages_1.PAYMENT_MESSAGES.WALLET_REMAINING(booking.bookingNumber), bookingId, 'BOOKING');
        const payment = await this.paymentRepository.create({
            orderId: `wallet_remaining_${Date.now()}_${bookingId}`,
            amount: remainingAmount,
            currency: 'INR',
            status: payment_model_1.PaymentStatus.COMPLETED,
            bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
            userId: (0, mongoose_util_1.toObjectId)(userId),
            paymentId: `wallet_remaining_${Date.now()}`,
        });
        await this.bookingRepository.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, { paymentStatus: booking_model_1.PaymentStatus.PAID });
        const stylistId = getIdString(booking.stylistId);
        await this.escrowService.holdAmount(bookingId, stylistId, booking.payableAmount);
        return payment_mapper_1.PaymentMapper.toResponseDto(payment);
    }
    async getPaymentById(id) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return payment_mapper_1.PaymentMapper.toResponseDto(payment);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.PaymentRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.RazorpayService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.EscrowService)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.WalletService)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.CouponService)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.ChatService)),
    __param(7, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], PaymentService);
