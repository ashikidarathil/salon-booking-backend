import { z } from 'zod';

export const OffDayRequestSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    type: z.enum(['SICK_LEAVE', 'VACATION', 'PERSONAL', 'EMERGENCY']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().optional(),
  })
  .strict();

export const OffDayActionSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    adminRemarks: z.string().optional(),
  })
  .strict();
