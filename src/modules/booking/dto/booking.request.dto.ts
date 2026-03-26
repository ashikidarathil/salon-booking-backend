import { z } from 'zod';
import {
  BookingItemInputSchema,
  CreateBookingSchema,
  CancelBookingSchema,
  RescheduleBookingSchema,
  UpdateBookingStatusSchema,
  BookingPaginationSchema,
  BookingStatsSchema,
} from './booking.schema';

export type BookingItemInput = z.infer<typeof BookingItemInputSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type CancelBookingDto = z.infer<typeof CancelBookingSchema>;
export type RescheduleBookingDto = z.infer<typeof RescheduleBookingSchema>;
export type UpdateBookingStatusDto = z.infer<typeof UpdateBookingStatusSchema>;
export type StylistBookingPaginationQueryDto = z.infer<typeof BookingPaginationSchema>;
export type BookingStatsQueryDto = z.infer<typeof BookingStatsSchema>;
