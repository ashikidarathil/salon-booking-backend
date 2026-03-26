import { z } from 'zod';

export const GetStylistWalletSchema = z.object({
  stylistId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID format'),
});
