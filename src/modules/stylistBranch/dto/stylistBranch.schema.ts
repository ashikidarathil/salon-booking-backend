import { z } from 'zod';

export const AssignStylistSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
  })
  .strict();

export const UnassignStylistSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
  })
  .strict();

export const ChangeBranchSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
  })
  .strict();
