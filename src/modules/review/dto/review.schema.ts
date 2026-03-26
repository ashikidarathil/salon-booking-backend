import { z } from 'zod';

export const CreateReviewSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(500, 'Comment is too long').optional(),
  })
  .strict();

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;

export const ReviewPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  stylistId: z.string().optional(),
  serviceId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export type ReviewPaginationDto = z.infer<typeof ReviewPaginationSchema>;

export const ReviewResponseSchema = z.object({
  id: z.string(),
  userId: z.object({
    _id: z.string(),
    name: z.string(),
    profilePicture: z.string().optional(),
  }),
  bookingId: z.string(),
  stylistId: z.string(),
  serviceId: z.string(),
  rating: z.number(),
  comment: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean().optional(),
});

export type ReviewResponseDto = z.infer<typeof ReviewResponseSchema>;

export const TopStylistSchema = z.object({
  stylistId: z.string(),
  stylistName: z.string(),
  avatar: z.string().optional(),
  specialization: z.string().optional(),
  averageRating: z.number(),
  totalReviews: z.number(),
  bookingCount: z.number(),
});

export type TopStylistDto = z.infer<typeof TopStylistSchema>;

export const TopServiceSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  categoryName: z.string().optional(),
  averageRating: z.number(),
  totalReviews: z.number(),
  bookingCount: z.number(),
});

export type TopServiceDto = z.infer<typeof TopServiceSchema>;
