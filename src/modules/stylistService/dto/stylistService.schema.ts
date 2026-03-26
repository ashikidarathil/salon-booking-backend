import { z } from 'zod';

export const ToggleStylistServiceStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const StylistServicePaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  stylistId: z.string().optional(),
  serviceId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
