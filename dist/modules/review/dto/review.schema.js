"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopServiceSchema = exports.TopStylistSchema = exports.ReviewResponseSchema = exports.ReviewPaginationSchema = exports.CreateReviewSchema = void 0;
const zod_1 = require("zod");
exports.CreateReviewSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: zod_1.z.string().max(500, 'Comment is too long').optional(),
})
    .strict();
exports.ReviewPaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    stylistId: zod_1.z.string().optional(),
    serviceId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    includeDeleted: zod_1.z
        .string()
        .optional()
        .transform((val) => val === 'true'),
});
exports.ReviewResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.object({
        _id: zod_1.z.string(),
        name: zod_1.z.string(),
        profilePicture: zod_1.z.string().optional(),
    }),
    bookingId: zod_1.z.string(),
    stylistId: zod_1.z.string(),
    serviceId: zod_1.z.string(),
    rating: zod_1.z.number(),
    comment: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.TopStylistSchema = zod_1.z.object({
    stylistId: zod_1.z.string(),
    stylistName: zod_1.z.string(),
    avatar: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    averageRating: zod_1.z.number(),
    totalReviews: zod_1.z.number(),
    bookingCount: zod_1.z.number(),
});
exports.TopServiceSchema = zod_1.z.object({
    serviceId: zod_1.z.string(),
    serviceName: zod_1.z.string(),
    imageUrl: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    categoryName: zod_1.z.string().optional(),
    averageRating: zod_1.z.number(),
    totalReviews: zod_1.z.number(),
    bookingCount: zod_1.z.number(),
});
