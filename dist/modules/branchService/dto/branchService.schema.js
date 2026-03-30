"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchServicePaginationSchema = exports.ToggleBranchServiceStatusSchema = exports.UpsertBranchServiceSchema = void 0;
const zod_1 = require("zod");
exports.UpsertBranchServiceSchema = zod_1.z
    .object({
    price: zod_1.z.number().positive('Price must be greater than 0'),
    duration: zod_1.z
        .number()
        .positive('Duration must be greater than 0')
        .int('Duration must be an integer'),
    isActive: zod_1.z.boolean().optional(),
})
    .strict();
exports.ToggleBranchServiceStatusSchema = zod_1.z
    .object({
    isActive: zod_1.z.boolean(),
})
    .strict();
exports.BranchServicePaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    categoryId: zod_1.z.string().optional(),
});
