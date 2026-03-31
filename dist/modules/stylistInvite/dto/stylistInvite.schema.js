"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistPaginationSchema = exports.StylistPositionSchema = exports.StylistBlockSchema = exports.ValidateStylistInviteSchema = exports.AcceptStylistInviteSchema = exports.CreateStylistInviteSchema = void 0;
const zod_1 = require("zod");
exports.CreateStylistInviteSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
    specialization: zod_1.z.string().min(2, 'Specialization is required'),
    experience: zod_1.z.number().min(0, 'Experience cannot be negative'),
})
    .strict();
exports.AcceptStylistInviteSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
})
    .strict();
exports.ValidateStylistInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
});
exports.StylistBlockSchema = zod_1.z.object({
    isBlocked: zod_1.z.boolean(),
});
exports.StylistPositionSchema = zod_1.z.object({
    position: zod_1.z.enum(['JUNIOR', 'SENIOR', 'TRAINEE']),
});
exports.StylistPaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    isBlocked: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    isActive: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    position: zod_1.z.enum(['JUNIOR', 'SENIOR', 'TRAINEE']).optional(),
    branchId: zod_1.z.string().optional(),
});
