import { z } from 'zod';
import { DiscountType, CouponFilterStatus } from '../../../models/coupon.model';

export const CreateCouponSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Coupon code is required')
      .regex(/^[A-Z0-9]+$/, 'Must be alphanumeric uppercase'),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().positive('Discount value must be greater than 0'),
    minBookingAmount: z.number().min(1, 'Minimum booking amount must be at least 1'),
    expiryDate: z.coerce.date(),
    maxUsage: z.number().min(1, 'Max usage must be at least 1'),
    maxDiscountAmount: z.number().min(0, 'Max discount amount cannot be negative'),
    applicableServices: z.array(z.string()).optional(),
  })
  .strict();

export const UpdateCouponSchema = CreateCouponSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const ValidateCouponSchema = z
  .object({
    code: z.string().min(1),
    amount: z.number().positive(),
  })
  .strict();

export const CouponPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  status: z.nativeEnum(CouponFilterStatus).optional(),
});
