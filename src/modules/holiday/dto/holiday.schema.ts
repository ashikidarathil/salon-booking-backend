import { z } from 'zod';

export const HolidayRequestSchema = z
  .object({
    branchId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID')
      .optional()
      .nullable(),
    date: z.string().min(1, 'Date is required'),
    name: z.string().min(1, 'Holiday name is required'),
    isAllBranches: z.boolean(),
  })
  .strict();
