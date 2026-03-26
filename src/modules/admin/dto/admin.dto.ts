import { z } from 'zod';

export interface AdminDashboardStatsDto {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    activeStylists: number;
    totalCustomers: number;
    pendingEscrow: number;
  };
  revenueTrend: {
    label: string;
    revenue: number;
    bookings: number;
  }[];
  bookingStatusBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  topStylists: {
    id: string;
    name: string;
    avatar?: string | null;
    revenue: number;
    bookings: number;
    rating: number;
  }[];
  userGrowth: {
    label: string;
    customers: number;
    stylists: number;
  }[];
}

export const ToggleBlockUserSchema = z.object({
  isBlocked: z.boolean(),
});

export const AdminStatsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const UserPaginationQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess((val) => Number(val), z.number().min(1).max(100).default(10)),
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.preprocess((val) => val === 'true', z.boolean().optional()),
  isBlocked: z.preprocess((val) => val === 'true', z.boolean().optional()),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ToggleBlockUserDto = z.infer<typeof ToggleBlockUserSchema>;
export type AdminStatsQueryDto = z.infer<typeof AdminStatsQuerySchema>;
export type UserPaginationQueryDto = z.infer<typeof UserPaginationQuerySchema>;
