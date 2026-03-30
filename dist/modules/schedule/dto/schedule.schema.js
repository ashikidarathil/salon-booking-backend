"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistBreakRequestSchema = exports.DailyOverrideRequestSchema = exports.WeeklyScheduleRequestSchema = exports.ShiftSchema = void 0;
const zod_1 = require("zod");
exports.ShiftSchema = zod_1.z
    .object({
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
})
    .strict();
exports.WeeklyScheduleRequestSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(),
    isWorkingDay: zod_1.z.boolean(),
    shifts: zod_1.z.array(exports.ShiftSchema),
})
    .strict();
exports.DailyOverrideRequestSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    date: zod_1.z.string().min(1, 'Date is required'),
    isWorkingDay: zod_1.z.boolean(),
    shifts: zod_1.z.array(exports.ShiftSchema),
    reason: zod_1.z.string().optional(),
})
    .strict();
exports.StylistBreakRequestSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(),
    date: zod_1.z.string().optional(),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    description: zod_1.z.string().optional(),
})
    .strict();
