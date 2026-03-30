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
exports.BookingService = void 0;
const booking_mapper_1 = require("../mapper/booking.mapper");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_messages_1 = require("../constants/booking.messages");
const booking_constants_1 = require("../constants/booking.constants");
const slot_constants_1 = require("../../slot/constants/slot.constants");
const booking_model_1 = require("../../../models/booking.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const coupon_model_1 = require("../../../models/coupon.model");
const booking_helpers_1 = require("./booking.helpers");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const notification_model_1 = require("../../../models/notification.model");
const ADVANCE_PERCENTAGE = 0.2; // 20% advance
const PAYMENT_WINDOW_MINUTES = 15;
let BookingService = class BookingService {
    getRefId(ref) {
        if (ref && typeof ref === 'object' && '_id' in ref) {
            return ref._id.toString();
        }
        return ref;
    }
    constructor(bookingRepo, slotService, bookingValidator, bookingQueryService, slotRepo, couponService, walletService, escrowService, notificationService) {
        this.bookingRepo = bookingRepo;
        this.slotService = slotService;
        this.bookingValidator = bookingValidator;
        this.bookingQueryService = bookingQueryService;
        this.slotRepo = slotRepo;
        this.couponService = couponService;
        this.walletService = walletService;
        this.escrowService = escrowService;
        this.notificationService = notificationService;
    }
    async createBooking(userId, items, notes) {
        const branchId = items[0].slotId.startsWith(slot_constants_1.SLOT_PREFIXES.DYNAMIC)
            ? items[0].slotId.split('_')[1]
            : booking_constants_1.BOOKING_DEFAULTS.BRANCH_ID;
        const bookingItems = await this.prepareBookingItems(branchId, items);
        const totalPrice = bookingItems.reduce((sum, item) => sum + item.price, 0);
        const payableAmount = totalPrice;
        const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);
        const bookingId = new mongoose_util_1.ObjectId();
        const bookingNumber = `BK-${bookingId.toString().slice(-6).toUpperCase()}`;
        const booking = await this.bookingRepo.create({
            _id: bookingId,
            bookingNumber,
            userId: (0, mongoose_util_1.toObjectId)(userId),
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            items: bookingItems,
            stylistId: bookingItems[0].stylistId,
            date: bookingItems[0].date,
            startTime: bookingItems[0].startTime,
            endTime: bookingItems[bookingItems.length - 1].endTime,
            totalPrice,
            payableAmount,
            advanceAmount,
            discountAmount: 0,
            status: booking_model_1.BookingStatus.PENDING_PAYMENT,
            paymentStatus: booking_model_1.PaymentStatus.PENDING,
            paymentWindowExpiresAt: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000),
            notes,
        });
        return booking_mapper_1.BookingMapper.toResponse(booking);
    }
    async cancelBooking(bookingId, userId, reason, role) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const stylistId = role === userRole_enum_1.UserRole.STYLIST ? await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo) : undefined;
        if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (role !== userRole_enum_1.UserRole.ADMIN) {
            this.bookingValidator.validateLeadTime(booking.startTime, booking.date);
        }
        const bookingUserId = booking.userId;
        if (booking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID) {
            const bookingNumber = booking.id.slice(-6).toUpperCase();
            await this.walletService.creditBalance(this.getRefId(bookingUserId), booking.advanceAmount, `Refund for cancelled booking #BK-${bookingNumber}`, bookingId, 'REFUND');
        }
        const updatePaymentStatus = booking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID
            ? booking_model_1.PaymentStatus.REFUNDED
            : booking.paymentStatus;
        const cancelledBy = role === userRole_enum_1.UserRole.ADMIN
            ? 'ADMIN'
            : role === userRole_enum_1.UserRole.STYLIST
                ? 'STYLIST'
                : role === userRole_enum_1.UserRole.USER
                    ? 'USER'
                    : 'SYSTEM';
        const updated = await this.bookingRepo.update({
            _id: (0, mongoose_util_1.toObjectId)(bookingId),
        }, {
            status: booking_model_1.BookingStatus.CANCELLED,
            cancelledBy,
            cancelledReason: reason,
            cancelledAt: new Date(),
            paymentStatus: updatePaymentStatus,
        });
        if (!updated) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.CANCEL_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const recipientId = this.getRefId(role === userRole_enum_1.UserRole.USER ? booking.stylistId : booking.userId);
        this.notificationService
            .createNotification({
            recipientId,
            type: notification_model_1.NotificationType.BOOKING_CANCELLED,
            title: 'Booking Cancelled',
            message: `Booking #${booking.bookingNumber} has been cancelled${reason ? `: ${reason}` : ''}.`,
            link: role === userRole_enum_1.UserRole.USER ? `/stylist/appointments` : `/profile/bookings/${booking.id}`,
        })
            .catch((err) => console.error('Failed to create cancellation notification:', err));
        return booking_mapper_1.BookingMapper.toResponse(updated);
    }
    async rescheduleBooking(bookingId, userId, items, reason, role) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const stylistId = role === userRole_enum_1.UserRole.STYLIST ? await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo) : undefined;
        if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.status !== booking_model_1.BookingStatus.CONFIRMED) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.ONLY_CONFIRMED_BOOKING_RESCHEDULE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (booking.paymentStatus !== booking_model_1.PaymentStatus.ADVANCE_PAID) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.RESCHEDULE_ADVANCE_PAYMENT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if ((booking.rescheduleCount ?? 0) >= 1) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.RESCHEDULE_ONCE_ONLY, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const bookingStartMs = booking.date.getTime();
        const [h, m] = booking.startTime.split(':').map(Number);
        const bookingStartTime = new Date(bookingStartMs);
        bookingStartTime.setHours(h, m, 0, 0);
        const leadTimeMs = bookingStartTime.getTime() - Date.now();
        const leadTimeHours = leadTimeMs / booking_constants_1.TIME_UTILS.MS_PER_HOUR;
        if (leadTimeHours < 24) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.RESCHEDULE_LEAD_TIME_24, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        const branchId = booking.branchId || booking_constants_1.BOOKING_DEFAULTS.BRANCH_ID;
        const bookingItems = await this.prepareBookingItems(branchId, items);
        const updated = await this.bookingRepo.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, {
            items: bookingItems,
            date: bookingItems[0].date,
            startTime: bookingItems[0].startTime,
            endTime: bookingItems[bookingItems.length - 1].endTime,
            rescheduleCount: (booking.rescheduleCount || 0) + 1,
            rescheduleReason: reason,
        });
        if (!updated) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.RESCHEDULE_FAILED_24, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const stylistUserId = booking.stylistId;
        this.notificationService
            .createNotification({
            recipientId: this.getRefId(stylistUserId),
            type: notification_model_1.NotificationType.SYSTEM,
            title: 'Booking Rescheduled',
            message: `Booking #${booking.bookingNumber} has been rescheduled to ${booking.date.toLocaleDateString()} at ${booking.startTime}.`,
            link: `/stylist/appointments`,
        })
            .catch((err) => console.error('Failed to create reschedule notification:', err));
        return booking_mapper_1.BookingMapper.toResponse(updated);
    }
    async updateBookingStatus(bookingId, userId, status, role) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const stylistId = role === userRole_enum_1.UserRole.STYLIST ? await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo) : undefined;
        if (!this.bookingValidator.isAuthorizedToModify(booking, userId, role, stylistId)) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        this.bookingValidator.validateStatusTransition(booking, status, role);
        const updateData = { status };
        if (status === booking_model_1.BookingStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        if (status === booking_model_1.BookingStatus.NO_SHOW) {
            if (booking.paymentStatus === booking_model_1.PaymentStatus.ADVANCE_PAID) {
                const stylistRawId = this.getRefId(booking.stylistId);
                await this.escrowService.holdAmount(bookingId, stylistRawId, booking.advanceAmount);
            }
        }
        const updated = await this.bookingRepo.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, updateData);
        if (!updated) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.FAILED_TO_UPDATE, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (status === booking_model_1.BookingStatus.COMPLETED || status === booking_model_1.BookingStatus.NO_SHOW) {
            const isCompleted = status === booking_model_1.BookingStatus.COMPLETED;
            this.notificationService
                .createNotification({
                recipientId: this.getRefId(booking.userId),
                type: isCompleted ? notification_model_1.NotificationType.BOOKING_COMPLETED : notification_model_1.NotificationType.SYSTEM,
                title: isCompleted ? 'Share Your Experience!' : 'Booking Status Updated',
                message: isCompleted
                    ? `Your booking #${booking.bookingNumber} is complete! Please take a moment to rate your stylist and service.`
                    : `Your booking #${booking.bookingNumber} is now marked as ${status.toLowerCase()}.`,
                link: `/profile/bookings/${booking.id}`,
            })
                .catch((err) => console.error('Failed to create status update notification:', err));
        }
        return booking_mapper_1.BookingMapper.toResponse(updated);
    }
    async getBookingDetails(bookingId) {
        return this.bookingQueryService.getBookingDetails(bookingId);
    }
    async listUserBookings(userId) {
        return this.bookingQueryService.listUserBookings(userId);
    }
    async listAllBookings(branchId, date) {
        return this.bookingQueryService.listAllBookings(branchId, date);
    }
    async listStylistBookings(userId, query) {
        return this.bookingQueryService.listStylistBookings(userId, query);
    }
    async getTodayBookings(branchId) {
        return this.bookingQueryService.getTodayBookings(branchId);
    }
    async getStylistTodayBookings(userId) {
        return this.bookingQueryService.getStylistTodayBookings(userId);
    }
    async getStylistStats(userId, period, date) {
        return this.bookingQueryService.getStylistStats(userId, period, date);
    }
    async applyCoupon(bookingId, couponCode, userId) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (this.getRefId(booking.userId) !== userId) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.status !== booking_model_1.BookingStatus.PENDING_PAYMENT) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.COUPON_PENDING_BOOKING, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const coupon = await this.couponService.validateCoupon(couponCode, booking.totalPrice);
        let discountAmount = 0;
        if (coupon.discountType === coupon_model_1.DiscountType.PERCENTAGE) {
            discountAmount = (booking.totalPrice * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }
        else {
            discountAmount = coupon.discountValue;
        }
        const payableAmount = Math.max(0, booking.totalPrice - discountAmount);
        const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);
        const couponObjectId = (0, mongoose_util_1.toObjectId)(coupon.id);
        const updated = await this.bookingRepo.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, {
            discountAmount,
            payableAmount,
            advanceAmount,
            couponId: couponObjectId,
        });
        if (!updated) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.FAILED_TO_APPLY_COUPON, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return booking_mapper_1.BookingMapper.toResponse(updated);
    }
    async removeCoupon(bookingId, userId) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (this.getRefId(booking.userId) !== userId) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.status !== booking_model_1.BookingStatus.PENDING_PAYMENT) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.COUPON_REMOVE_PENDING_BOOKING, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!booking.couponId) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NO_COUPON_APPLIED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const payableAmount = booking.totalPrice;
        const advanceAmount = Math.ceil(payableAmount * ADVANCE_PERCENTAGE);
        const updated = await this.bookingRepo.update({ _id: (0, mongoose_util_1.toObjectId)(bookingId) }, {
            $set: {
                discountAmount: 0,
                payableAmount,
                advanceAmount,
            },
            $unset: { couponId: 1 },
        });
        if (!updated) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.FAILED_TO_REMOVE_COUPON, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return booking_mapper_1.BookingMapper.toResponse(updated);
    }
    async prepareBookingItems(branchId, items) {
        const bookingItems = [];
        for (const item of items) {
            const stylistId = await (0, booking_helpers_1.resolveStylistId)(item.stylistId, this.slotRepo);
            const branchService = await this.slotRepo.findBranchService(branchId, item.serviceId);
            const duration = branchService?.duration ?? booking_constants_1.BOOKING_DEFAULTS.DURATION;
            const price = branchService?.price ?? booking_constants_1.BOOKING_DEFAULTS.PRICE;
            const isAvailable = await this.slotService.validateSlot(branchId, stylistId, new Date(item.date), item.startTime, duration);
            if (!isAvailable) {
                throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.SLOT_UNAVAILABLE_AT(item.startTime), httpStatus_enum_1.HttpStatus.CONFLICT);
            }
            const endTime = (0, booking_helpers_1.minutesToTime)((0, booking_helpers_1.timeToMinutes)(item.startTime) + duration);
            bookingItems.push({
                serviceId: (0, mongoose_util_1.toObjectId)(item.serviceId),
                stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
                date: new Date(item.date),
                startTime: item.startTime,
                endTime,
                price,
                duration,
            });
        }
        return bookingItems;
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingValidator)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingQueryService)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.CouponService)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.WalletService)),
    __param(7, (0, tsyringe_1.inject)(tokens_1.TOKENS.EscrowService)),
    __param(8, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BookingService);
