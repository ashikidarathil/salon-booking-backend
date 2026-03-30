"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSpecialSlotsQuerySchema = exports.CreateSpecialSlotSchema = exports.BlockSlotSchema = exports.GetAvailableSlotsQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetAvailableSlotsQuerySchema = zod_1.z.object({
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    date: zod_1.z.string().min(1, 'Date is required'),
    stylistId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID')
        .optional(),
    serviceId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
        .optional(),
    duration: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined)),
});
exports.BlockSlotSchema = zod_1.z
    .object({
    reason: zod_1.z.string().optional(),
})
    .strict();
exports.CreateSpecialSlotSchema = zod_1.z
    .object({
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    date: zod_1.z.string().min(1, 'Date is required'),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    note: zod_1.z.string().optional(),
    serviceId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
        .optional(),
})
    .strict();
exports.ListSpecialSlotsQuerySchema = zod_1.z.object({
    branchId: zod_1.z.string().optional(),
    stylistId: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
