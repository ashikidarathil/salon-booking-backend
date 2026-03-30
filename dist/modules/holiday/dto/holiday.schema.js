"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayRequestSchema = void 0;
const zod_1 = require("zod");
exports.HolidayRequestSchema = zod_1.z
    .object({
    branchIds: zod_1.z.array(zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID')).optional(),
    date: zod_1.z.string().min(1, 'Date is required'),
    name: zod_1.z.string().min(1, 'Holiday name is required'),
    isAllBranches: zod_1.z.boolean(),
})
    .strict()
    .refine((data) => data.isAllBranches || (data.branchIds && data.branchIds.length > 0), {
    message: 'Please select at least one branch or apply to all branches',
    path: ['branchIds'],
});
