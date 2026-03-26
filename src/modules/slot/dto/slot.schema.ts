import { z } from 'zod';

export const GetAvailableSlotsQuerySchema = z.object({
  branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
  date: z.string().min(1, 'Date is required'),
  stylistId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID')
    .optional(),
  serviceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
    .optional(),
  duration: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

export const BlockSlotSchema = z
  .object({
    reason: z.string().optional(),
  })
  .strict();

export const CreateSpecialSlotSchema = z
  .object({
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    note: z.string().optional(),
    serviceId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
      .optional(),
  })
  .strict();

export const ListSpecialSlotsQuerySchema = z.object({
  branchId: z.string().optional(),
  stylistId: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
});
