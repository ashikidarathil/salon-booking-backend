import { z } from 'zod';

export const UpsertBranchServiceSchema = z
  .object({
    price: z.number().positive('Price must be greater than 0'),
    duration: z
      .number()
      .positive('Duration must be greater than 0')
      .int('Duration must be an integer'),
    isActive: z.boolean().optional(),
  })
  .strict();

export const ToggleBranchServiceStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const BranchServicePaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  categoryId: z.string().optional(),
});
