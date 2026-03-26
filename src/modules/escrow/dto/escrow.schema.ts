import { z } from 'zod';

export const EscrowPaginationSchema = z.object({
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
  status: z.string().optional(),
  releaseDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
