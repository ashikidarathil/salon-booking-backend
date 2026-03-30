"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponPaginationSchema = exports.ValidateCouponSchema = exports.UpdateCouponSchema = exports.CreateCouponSchema = void 0;
const zod_1 = require("zod");
const coupon_model_1 = require("../../../models/coupon.model");
exports.CreateCouponSchema = zod_1.z
    .object({
    code: zod_1.z
        .string()
        .min(1, 'Coupon code is required')
        .regex(/^[A-Z0-9]+$/, 'Must be alphanumeric uppercase'),
    discountType: zod_1.z.nativeEnum(coupon_model_1.DiscountType),
    discountValue: zod_1.z.number().positive('Discount value must be greater than 0'),
    minBookingAmount: zod_1.z.number().min(1, 'Minimum booking amount must be at least 1'),
    expiryDate: zod_1.z.coerce.date(),
    maxUsage: zod_1.z.number().min(1, 'Max usage must be at least 1'),
    maxDiscountAmount: zod_1.z.number().min(0, 'Max discount amount cannot be negative'),
    applicableServices: zod_1.z.array(zod_1.z.string()).optional(),
})
    .strict();
exports.UpdateCouponSchema = exports.CreateCouponSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.ValidateCouponSchema = zod_1.z
    .object({
    code: zod_1.z.string().min(1),
    amount: zod_1.z.number().positive(),
})
    .strict();
exports.CouponPaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(coupon_model_1.CouponFilterStatus).optional(),
});
