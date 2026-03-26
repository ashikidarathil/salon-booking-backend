import { z } from 'zod';

export const CreateServiceSchema = z
  .object({
    name: z.string().min(1, 'Service name is required'),
    description: z.string().optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    imageUrl: z.string().url('Invalid image URL').optional(),
    whatIncluded: z.array(z.string()).optional(),
  })
  .strict();

export const UpdateServiceSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
      .optional(),
    whatIncluded: z.array(z.string()).optional(),
  })
  .strict();

export const ServicePaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
