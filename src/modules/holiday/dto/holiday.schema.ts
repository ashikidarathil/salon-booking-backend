import { z } from 'zod';

export const HolidayRequestSchema = z
  .object({
    branchIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID')).optional(),
    date: z.string().min(1, 'Date is required'),
    name: z.string().min(1, 'Holiday name is required'),
    isAllBranches: z.boolean(),
  })
  .strict()
  .refine((data) => data.isAllBranches || (data.branchIds && data.branchIds.length > 0), {
    message: 'Please select at least one branch or apply to all branches',
    path: ['branchIds'],
  });
