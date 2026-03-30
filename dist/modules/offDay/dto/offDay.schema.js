"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffDayActionSchema = exports.OffDayRequestSchema = void 0;
const zod_1 = require("zod");
exports.OffDayRequestSchema = zod_1.z
    .object({
    stylistId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID')
        .optional(),
    branchId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    type: zod_1.z.enum(['SICK_LEAVE', 'VACATION', 'PERSONAL', 'EMERGENCY']),
    startDate: zod_1.z.string().min(1, 'Start date is required'),
    endDate: zod_1.z.string().min(1, 'End date is required'),
    reason: zod_1.z.string().optional(),
})
    .strict();
exports.OffDayActionSchema = zod_1.z
    .object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    adminRemarks: zod_1.z.string().optional(),
})
    .strict();
