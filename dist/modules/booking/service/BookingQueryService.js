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
exports.BookingQueryService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const booking_mapper_1 = require("../mapper/booking.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_messages_1 = require("../constants/booking.messages");
const booking_helpers_1 = require("./booking.helpers");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const booking_model_1 = require("../../../models/booking.model");
let BookingQueryService = class BookingQueryService {
    constructor(bookingRepo, slotRepo, userRepo) {
        this.bookingRepo = bookingRepo;
        this.slotRepo = slotRepo;
        this.userRepo = userRepo;
    }
    async getBookingDetails(bookingId) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return booking_mapper_1.BookingMapper.toResponse(booking);
    }
    async listUserBookings(userId) {
        const bookings = await this.bookingRepo.find({ userId: (0, mongoose_util_1.toObjectId)(userId) });
        return booking_mapper_1.BookingMapper.toResponseList(bookings);
    }
    async listAllBookings(branchId, date) {
        const query = {};
        if (branchId)
            query.branchId = (0, mongoose_util_1.toObjectId)(branchId);
        if (date)
            query.date = new Date(date);
        const bookings = await this.bookingRepo.find(query);
        return booking_mapper_1.BookingMapper.toResponseList(bookings);
    }
    async listStylistBookings(userId, query) {
        const stylistId = await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo);
        const filter = {
            $or: [{ stylistId: (0, mongoose_util_1.toObjectId)(stylistId) }, { 'items.stylistId': (0, mongoose_util_1.toObjectId)(stylistId) }],
        };
        if (query.date) {
            const date = new Date(query.date);
            date.setUTCHours(0, 0, 0, 0);
            filter.date = date;
        }
        if (query.search) {
            const users = await this.userRepo.findAll({
                name: { $regex: query.search, $options: 'i' },
            });
            const userIds = users.map((u) => (0, mongoose_util_1.toObjectId)(u.id));
            filter.userId = { $in: userIds };
        }
        const result = await this.bookingRepo.findPaginated({
            ...query,
            ...filter,
            sortBy: query.sortBy || 'date',
            sortOrder: query.sortOrder || 'desc',
        });
        return {
            data: booking_mapper_1.BookingMapper.toResponseList(result.data),
            pagination: result.pagination,
        };
    }
    async getTodayBookings(branchId) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const query = { date: today };
        if (branchId)
            query.branchId = (0, mongoose_util_1.toObjectId)(branchId);
        const bookings = await this.bookingRepo.find(query);
        return booking_mapper_1.BookingMapper.toResponseList(bookings);
    }
    async getStylistTodayBookings(userId) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const result = await this.listStylistBookings(userId, {
            date: today.toISOString(),
            limit: 100,
            page: 1,
            sortBy: 'date',
            sortOrder: 'desc',
        });
        return result.data;
    }
    async getStylistStats(userId, period = 'today', date) {
        const stylistId = await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo);
        const filter = {
            $or: [{ stylistId: (0, mongoose_util_1.toObjectId)(stylistId) }, { 'items.stylistId': (0, mongoose_util_1.toObjectId)(stylistId) }],
        };
        let startDate;
        let endDate;
        let groupBy = 'hour';
        const baseDate = date ? new Date(date) : new Date();
        if (period === 'today') {
            startDate = new Date(baseDate);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'hour';
        }
        else if (period === 'week') {
            startDate = new Date(baseDate);
            startDate.setUTCDate(startDate.getUTCDate() - 6);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'day';
        }
        else if (period === 'month') {
            startDate = new Date(baseDate);
            startDate.setUTCDate(startDate.getUTCDate() - 29);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'day';
        }
        else if (period === 'year') {
            startDate = new Date(baseDate);
            startDate.setUTCMonth(0, 1);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCMonth(11, 31);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'month';
        }
        else {
            startDate = new Date(baseDate);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
        }
        filter.date = { $gte: startDate, $lte: endDate };
        const bookings = await this.bookingRepo.find(filter);
        const summary = {
            total: bookings.length,
            confirmed: bookings.filter((b) => b.status === booking_model_1.BookingStatus.CONFIRMED).length,
            pending: bookings.filter((b) => b.status === booking_model_1.BookingStatus.PENDING_PAYMENT)
                .length,
            cancelled: bookings.filter((b) => b.status === booking_model_1.BookingStatus.CANCELLED).length,
            completed: bookings.filter((b) => b.status === booking_model_1.BookingStatus.COMPLETED).length,
            revenue: bookings
                .filter((b) => b.status !== booking_model_1.BookingStatus.CANCELLED && b.status !== booking_model_1.BookingStatus.FAILED)
                .reduce((sum, b) => sum + (b.payableAmount ?? b.totalPrice ?? 0), 0),
        };
        const chartData = [];
        if (groupBy === 'hour') {
            for (let i = 0; i < 24; i++) {
                const hourStr = i.toString().padStart(2, '0');
                const label = `${hourStr}:00`;
                const hourBookings = bookings.filter((b) => b.startTime.startsWith(hourStr));
                chartData.push({
                    label,
                    bookings: hourBookings.length,
                    revenue: hourBookings
                        .filter((b) => b.status !== booking_model_1.BookingStatus.CANCELLED && b.status !== booking_model_1.BookingStatus.FAILED)
                        .reduce((sum, b) => sum + (b.payableAmount ?? b.totalPrice ?? 0), 0),
                });
            }
        }
        else if (groupBy === 'day') {
            const days = period === 'week' ? 7 : 30;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(endDate);
                d.setUTCDate(d.getUTCDate() - i);
                const label = d.toISOString().split('T')[0];
                const dayBookings = bookings.filter((b) => b.date.toISOString().split('T')[0] === label);
                chartData.push({
                    label,
                    bookings: dayBookings.length,
                    revenue: dayBookings
                        .filter((b) => b.status !== booking_model_1.BookingStatus.CANCELLED && b.status !== booking_model_1.BookingStatus.FAILED)
                        .reduce((sum, b) => sum + (b.payableAmount ?? b.totalPrice ?? 0), 0),
                });
            }
        }
        else if (groupBy === 'month') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(endDate);
                d.setUTCMonth(d.getUTCMonth() - i);
                const year = d.getUTCFullYear();
                const month = d.getUTCMonth();
                const label = `${year}-${(month + 1).toString().padStart(2, '0')}`;
                const monthBookings = bookings.filter((b) => {
                    const bDate = b.date;
                    return bDate.getUTCFullYear() === year && bDate.getUTCMonth() === month;
                });
                chartData.push({
                    label,
                    bookings: monthBookings.length,
                    revenue: monthBookings
                        .filter((b) => b.status !== booking_model_1.BookingStatus.CANCELLED && b.status !== booking_model_1.BookingStatus.FAILED)
                        .reduce((sum, b) => sum + (b.payableAmount ?? b.totalPrice ?? 0), 0),
                });
            }
        }
        const statusBreakdown = [
            { name: 'Confirmed', value: summary.confirmed, color: '#10b981' },
            { name: 'Pending', value: summary.pending, color: '#f59e0b' },
            { name: 'Cancelled', value: summary.cancelled, color: '#ef4444' },
            { name: 'Completed', value: summary.completed, color: '#3b82f6' },
        ];
        return {
            summary,
            chartData,
            statusBreakdown,
            period,
            range: { start: startDate, end: endDate },
        };
    }
    async checkExpiredBookings() {
        const expiredBookings = await this.bookingRepo.find({
            status: booking_model_1.BookingStatus.PENDING_PAYMENT,
            paymentStatus: booking_model_1.PaymentStatus.PENDING,
            paymentWindowExpiresAt: { $lt: new Date() },
        });
        let count = 0;
        for (const booking of expiredBookings) {
            const updated = await this.bookingRepo.update({ _id: (0, mongoose_util_1.toObjectId)(booking.id) }, {
                status: booking_model_1.BookingStatus.FAILED,
                paymentStatus: booking_model_1.PaymentStatus.FAILED,
                cancelledBy: 'SYSTEM',
                cancelledReason: 'Payment window expired (15 minutes)',
                cancelledAt: new Date(),
            });
            if (updated)
                count++;
        }
        return count;
    }
};
exports.BookingQueryService = BookingQueryService;
exports.BookingQueryService = BookingQueryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookingQueryService);
