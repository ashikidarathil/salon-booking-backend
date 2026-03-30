"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatsSchema = exports.BookingPaginationSchema = exports.UpdateBookingStatusSchema = exports.RescheduleBookingSchema = exports.CancelBookingSchema = exports.CreateBookingSchema = exports.BookingItemInputSchema = void 0;
const zod_1 = require("zod");
const booking_model_1 = require("../../../models/booking.model");
exports.BookingItemInputSchema = zod_1.z
    .object({
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    stylistId: zod_1.z.string().min(1, 'Stylist ID is required'),
    date: zod_1.z.string().min(1, 'Date is required'),
    startTime: zod_1.z.string().min(1, 'Start time is required'),
    slotId: zod_1.z.string().min(1, 'Slot ID is required'),
})
    .strict();
exports.CreateBookingSchema = zod_1.z
    .object({
    items: zod_1.z.array(exports.BookingItemInputSchema).min(1, 'At least one service is required'),
    notes: zod_1.z.string().optional(),
})
    .strict();
exports.CancelBookingSchema = zod_1.z
    .object({
    reason: zod_1.z.string().optional(),
})
    .strict();
exports.RescheduleBookingSchema = zod_1.z
    .object({
    items: zod_1.z.array(exports.BookingItemInputSchema).min(1, 'At least one service is required'),
    reason: zod_1.z.string().optional(),
})
    .strict();
exports.UpdateBookingStatusSchema = zod_1.z
    .object({
    status: zod_1.z.nativeEnum(booking_model_1.BookingStatus),
})
    .strict();
exports.BookingPaginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => (val ? parseInt(val) : 1), zod_1.z.number().min(1)),
    limit: zod_1.z.preprocess((val) => (val ? parseInt(val) : 10), zod_1.z.number().min(1).max(100)),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional().default('date'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.BookingStatsSchema = zod_1.z.object({
    period: zod_1.z.enum(['today', 'week', 'month', 'year']).optional().default('today'),
    date: zod_1.z.string().optional(),
});
