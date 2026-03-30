"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNearestBranchesSchema = exports.UpdateBranchSchema = exports.CreateBranchSchema = void 0;
const zod_1 = require("zod");
const BreakSchema = zod_1.z
    .object({
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    description: zod_1.z.string(),
})
    .strict();
exports.CreateBranchSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, 'Branch name is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    phone: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    defaultBreaks: zod_1.z.array(BreakSchema).optional(),
})
    .strict();
exports.UpdateBranchSchema = exports.CreateBranchSchema.partial();
exports.GetNearestBranchesSchema = zod_1.z
    .object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    radius: zod_1.z.number().optional().default(10),
})
    .strict();
