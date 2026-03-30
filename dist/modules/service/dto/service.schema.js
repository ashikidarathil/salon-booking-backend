"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePaginationSchema = exports.UpdateServiceSchema = exports.CreateServiceSchema = void 0;
const zod_1 = require("zod");
exports.CreateServiceSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, 'Service name is required'),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    imageUrl: zod_1.z.string().url('Invalid image URL').optional(),
    whatIncluded: zod_1.z.array(zod_1.z.string()).optional(),
})
    .strict();
exports.UpdateServiceSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    imageUrl: zod_1.z.string().url('Invalid image URL').optional(),
    categoryId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
        .optional(),
    whatIncluded: zod_1.z.array(zod_1.z.string()).optional(),
})
    .strict();
exports.ServicePaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
