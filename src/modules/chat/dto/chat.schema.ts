import { z } from 'zod';

export const InitializeRoomSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();

export const ChatPaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  skip: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

export const MarkChatAsReadSchema = z
  .object({
    roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
  })
  .strict();
