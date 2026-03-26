import { z } from 'zod';

const BreakSchema = z
  .object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    description: z.string(),
  })
  .strict();

export const CreateBranchSchema = z
  .object({
    name: z.string().min(1, 'Branch name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    defaultBreaks: z.array(BreakSchema).optional(),
  })
  .strict();

export const UpdateBranchSchema = CreateBranchSchema.partial();

export const GetNearestBranchesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().optional().default(10),
  })
  .strict();
