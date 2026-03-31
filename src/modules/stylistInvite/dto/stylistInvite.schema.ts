import { z } from 'zod';

export const CreateStylistInviteSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    specialization: z.string().min(2, 'Specialization is required'),
    experience: z.number().min(0, 'Experience cannot be negative'),
  })
  .strict();

export const AcceptStylistInviteSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .strict();

export const ValidateStylistInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const StylistBlockSchema = z.object({
  isBlocked: z.boolean(),
});

export const StylistPositionSchema = z.object({
  position: z.enum(['JUNIOR', 'SENIOR', 'TRAINEE']),
});

export const StylistPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  status: z.string().optional(),
  isBlocked: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  position: z.enum(['JUNIOR', 'SENIOR', 'TRAINEE']).optional(),
  branchId: z.string().optional(),
});
