"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPaginationQuerySchema = exports.AdminStatsQuerySchema = exports.ToggleBlockUserSchema = void 0;
const zod_1 = require("zod");
exports.ToggleBlockUserSchema = zod_1.z.object({
    isBlocked: zod_1.z.boolean(),
});
exports.AdminStatsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['today', 'week', 'month', 'year']).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
exports.UserPaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(1).default(1)),
    limit: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(1).max(100).default(10)),
    search: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    isActive: zod_1.z.preprocess((val) => val === 'true', zod_1.z.boolean().optional()),
    isBlocked: zod_1.z.preprocess((val) => val === 'true', zod_1.z.boolean().optional()),
    sortBy: zod_1.z.string().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
