import { IBooking } from '../../../models/booking.model';
import { ClientSession, UpdateQuery } from 'mongoose';

export interface IBookingRepository {
  create(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking>;
  findById(id: string): Promise<IBooking | null>;
  find(filter: Record<string, unknown>): Promise<IBooking[]>;
  update(
    id: string,
    data: UpdateQuery<IBooking>,
    session?: ClientSession,
  ): Promise<IBooking | null>;
  findOverlappingBooking(
    stylistId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<IBooking | null>;
}
