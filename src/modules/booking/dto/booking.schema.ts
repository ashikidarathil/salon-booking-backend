import { z } from 'zod';
import { BookingStatus } from '../../../models/booking.model';

export const BookingItemInputSchema = z
  .object({
    serviceId: z.string().min(1, 'Service ID is required'),
    stylistId: z.string().min(1, 'Stylist ID is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    slotId: z.string().min(1, 'Slot ID is required'),
  })
  .strict();

export const CreateBookingSchema = z
  .object({
    items: z.array(BookingItemInputSchema).min(1, 'At least one service is required'),
    notes: z.string().optional(),
  })
  .strict();

export const CancelBookingSchema = z
  .object({
    reason: z.string().optional(),
  })
  .strict();

export const RescheduleBookingSchema = z
  .object({
    items: z.array(BookingItemInputSchema).min(1, 'At least one service is required'),
    reason: z.string().optional(),
  })
  .strict();

export const UpdateBookingStatusSchema = z
  .object({
    status: z.nativeEnum(BookingStatus),
  })
  .strict();

export const BookingPaginationSchema = z.object({
  page: z.preprocess((val) => (val ? parseInt(val as string) : 1), z.number().min(1)),
  limit: z.preprocess((val) => (val ? parseInt(val as string) : 10), z.number().min(1).max(100)),
  search: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const BookingStatsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('today'),
  date: z.string().optional(),
});
