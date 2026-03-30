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
exports.AdminMapper = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const booking_model_1 = require("../../../models/booking.model");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
let AdminMapper = class AdminMapper {
    constructor(stylistRepo, reviewRepo) {
        this.stylistRepo = stylistRepo;
        this.reviewRepo = reviewRepo;
    }
    async toDashboardStatsDto(data, query) {
        const { allBookings, allUsers, escrowItems } = data;
        const { period = 'month', startDate: qStart, endDate: qEnd } = query;
        let startDate;
        let endDate;
        let groupBy = 'day';
        const baseDate = qEnd ? new Date(qEnd) : new Date();
        if (qStart && qEnd) {
            startDate = new Date(qStart);
            endDate = new Date(qEnd);
            groupBy = 'day';
        }
        else if (period === 'today') {
            startDate = new Date(baseDate);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'hour';
        }
        else if (period === 'week') {
            startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() - 6);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'day';
        }
        else if (period === 'month') {
            startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() - 29);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'day';
        }
        else if (period === 'year') {
            startDate = new Date(baseDate.getFullYear(), 0, 1);
            endDate = new Date(baseDate.getFullYear(), 11, 31, 23, 59, 59, 999);
            groupBy = 'month';
        }
        else {
            startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() - 29);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(baseDate);
            endDate.setUTCHours(23, 59, 59, 999);
            groupBy = 'day';
        }
        const bookingsInPeriod = allBookings.filter((b) => {
            const bDate = b.date;
            return bDate >= startDate && bDate <= endDate;
        });
        const completedInPeriod = bookingsInPeriod.filter((b) => b.status === booking_model_1.BookingStatus.COMPLETED);
        const totalRevenue = completedInPeriod.reduce((sum, b) => sum + (b.payableAmount || b.totalPrice || 0), 0);
        const activeCustomers = allUsers.filter((u) => u.role === userRole_enum_1.UserRole.USER && u.isActive).length;
        const activeStylists = allUsers.filter((u) => u.role === userRole_enum_1.UserRole.STYLIST && (u.status === 'ACTIVE' || u.status === 'ACCEPTED')).length;
        const pendingEscrow = escrowItems.reduce((sum, item) => sum + item.amount, 0);
        const summary = {
            totalRevenue,
            totalBookings: completedInPeriod.length,
            activeStylists,
            totalCustomers: activeCustomers,
            pendingEscrow,
        };
        const revenueTrend = [];
        const dateRange = this.getDateRange(startDate, endDate, groupBy);
        for (const date of dateRange) {
            const label = this.formatDateLabel(date, groupBy);
            const { year, month } = this.getDateParts(date);
            const dateFilter = (d) => {
                if (groupBy === 'hour') {
                    return (d.toISOString().split('T')[0] === date.toISOString().split('T')[0] &&
                        d.getHours() === date.getHours());
                }
                else if (groupBy === 'day') {
                    return d.toISOString().split('T')[0] === date.toISOString().split('T')[0];
                }
                return d.getFullYear() === year && d.getMonth() === month - 1;
            };
            const periodTrendBookings = completedInPeriod.filter((b) => dateFilter(b.date));
            const rev = periodTrendBookings.reduce((sum, b) => sum + (b.payableAmount || b.totalPrice || 0), 0);
            revenueTrend.push({
                label,
                revenue: rev,
                bookings: periodTrendBookings.length,
            });
        }
        const bookingStatusBreakdown = [
            {
                name: 'Completed',
                value: bookingsInPeriod.filter((b) => b.status === booking_model_1.BookingStatus.COMPLETED)
                    .length,
                color: '#10b981',
            },
            {
                name: 'Confirmed',
                value: bookingsInPeriod.filter((b) => b.status === booking_model_1.BookingStatus.CONFIRMED)
                    .length,
                color: '#3b82f6',
            },
            {
                name: 'Cancelled',
                value: bookingsInPeriod.filter((b) => b.status === booking_model_1.BookingStatus.CANCELLED)
                    .length,
                color: '#ef4444',
            },
            {
                name: 'Pending',
                value: bookingsInPeriod.filter((b) => b.status === booking_model_1.BookingStatus.PENDING_PAYMENT).length,
                color: '#f59e0b',
            },
        ];
        const userGrowth = [];
        revenueTrend.forEach((rt) => {
            const usersInPeriod = allUsers.filter((u) => {
                if (!u.createdAt)
                    return false;
                const uDate = new Date(u.createdAt);
                const y = uDate.getFullYear();
                const m = uDate.getMonth() + 1;
                if (groupBy === 'hour') {
                    const uDateStr = uDate.toISOString().split('T')[0];
                    const endDayStr = endDate.toISOString().split('T')[0];
                    return (uDateStr === endDayStr &&
                        uDate.getUTCHours().toString().padStart(2, '0') + ':00' === rt.label);
                }
                else if (groupBy === 'day') {
                    return uDate.toISOString().split('T')[0] === rt.label;
                }
                else if (groupBy === 'month') {
                    return `${y}-${m.toString().padStart(2, '0')}` === rt.label;
                }
                return false;
            });
            userGrowth.push({
                label: rt.label,
                customers: usersInPeriod.filter((u) => u.role === userRole_enum_1.UserRole.USER).length,
                stylists: usersInPeriod.filter((u) => u.role === userRole_enum_1.UserRole.STYLIST).length,
            });
        });
        const stylistStatsMap = new Map();
        const getRefId = (ref) => ref && typeof ref === 'object' && '_id' in ref ? ref._id.toString() : ref;
        completedInPeriod.forEach((b) => {
            const sId = getRefId(b.stylistId);
            if (!sId)
                return;
            const stats = stylistStatsMap.get(sId) || { revenue: 0, bookings: 0 };
            stats.revenue += b.payableAmount || b.totalPrice || 0;
            stats.bookings += 1;
            stylistStatsMap.set(sId, stats);
        });
        const topStylists = await Promise.all(Array.from(stylistStatsMap.entries())
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5)
            .map(async ([id, stats]) => {
            const [stylist, ratingData] = await Promise.all([
                this.stylistRepo.getById(id),
                this.reviewRepo.getStylistRating(id),
            ]);
            return {
                id,
                name: stylist?.name || 'Unknown',
                avatar: stylist?.profilePicture || null,
                revenue: stats.revenue,
                bookings: stats.bookings,
                rating: ratingData.averageRating || 0,
            };
        }));
        return {
            summary,
            revenueTrend,
            bookingStatusBreakdown,
            topStylists,
            userGrowth,
        };
    }
    getDateRange(start, end, groupBy) {
        const dates = [];
        const current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current));
            if (groupBy === 'hour') {
                current.setUTCHours(current.getUTCHours() + 1);
            }
            else if (groupBy === 'day') {
                current.setUTCDate(current.getUTCDate() + 1);
            }
            else {
                current.setUTCMonth(current.getUTCMonth() + 1);
            }
        }
        return dates;
    }
    formatDateLabel(date, groupBy) {
        if (groupBy === 'hour') {
            return `${date.getUTCHours().toString().padStart(2, '0')}:00`;
        }
        else if (groupBy === 'day') {
            return date.toISOString().split('T')[0];
        }
        else {
            return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
        }
    }
    getDateParts(date) {
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
        };
    }
};
exports.AdminMapper = AdminMapper;
exports.AdminMapper = AdminMapper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ReviewRepository)),
    __metadata("design:paramtypes", [Object, Object])
], AdminMapper);
