"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistServicePaginationSchema = exports.ToggleStylistServiceStatusSchema = void 0;
const zod_1 = require("zod");
exports.ToggleStylistServiceStatusSchema = zod_1.z
    .object({
    isActive: zod_1.z.boolean(),
})
    .strict();
exports.StylistServicePaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    stylistId: zod_1.z.string().optional(),
    serviceId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
