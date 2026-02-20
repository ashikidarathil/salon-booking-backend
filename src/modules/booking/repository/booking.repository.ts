import { IBooking, BookingModel } from '../../../models/booking.model';
import { IBookingRepository } from './IBookingRepository';
import { injectable } from 'tsyringe';
import { ClientSession, UpdateQuery } from 'mongoose';

@injectable()
export class BookingRepository implements IBookingRepository {
  async create(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking> {
    const bookings = await BookingModel.create([data], { session });
    return bookings[0];
  }

  async findById(id: string): Promise<IBooking | null> {
    return await BookingModel.findById(id);
  }

  async find(filter: Record<string, unknown>): Promise<IBooking[]> {
    return await BookingModel.find(filter);
  }

  async update(
    id: string,
    data: UpdateQuery<IBooking>,
    session?: ClientSession,
  ): Promise<IBooking | null> {
    return await BookingModel.findByIdAndUpdate(id, data, { new: true, session });
  }

  async findOverlappingBooking(
    stylistId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<IBooking | null> {
    return await BookingModel.findOne({
      stylistId,
      date,
      status: 'CONFIRMED',
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
  }
}
