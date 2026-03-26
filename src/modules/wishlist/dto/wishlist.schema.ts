import { z } from 'zod';

export const WishlistToggleSchema = z
  .object({
    stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
  })
  .strict();
