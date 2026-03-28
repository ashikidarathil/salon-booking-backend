import { z } from 'zod';

export const ShiftSchema = z
  .object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  })
  .strict();

export const WeeklyScheduleRequestSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    isWorkingDay: z.boolean(),
    shifts: z.array(ShiftSchema),
  })
  .strict();

export const DailyOverrideRequestSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    date: z.string().min(1, 'Date is required'),
    isWorkingDay: z.boolean(),
    shifts: z.array(ShiftSchema),
    reason: z.string().optional(),
  })
  .strict();

export const StylistBreakRequestSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    date: z.string().optional(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    description: z.string().optional(),
  })
  .strict();
