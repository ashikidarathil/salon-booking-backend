import { IBooking, BookingModel } from '../../../models/booking.model';
import { IBookingRepository } from './IBookingRepository';
import { injectable } from 'tsyringe';
import { ClientSession, PopulateOptions, UpdateQuery } from 'mongoose';
import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking, IBooking>
  implements IBookingRepository
{
  private readonly populateOptions: PopulateOptions[] = [
    { path: 'userId', select: 'name' },
    {
      path: 'stylistId',
      select: 'profilePicture',
      populate: { path: 'userId', select: 'name' },
    },
    { path: 'items.serviceId', select: 'name' },
    {
      path: 'items.stylistId',
      populate: { path: 'userId', select: 'name' },
    },
  ];

  constructor() {
    super(BookingModel);
  }

  protected toEntity(doc: IBooking): IBooking {
    return doc;
  }

  override async findById(
    id: string,
    populate: PopulateOptions[] = this.populateOptions,
  ): Promise<IBooking | null> {
    return super.findById(id, populate);
  }

  override async find(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.populateOptions,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<IBooking[]> {
    return super.find(filter, populate, sort);
  }

  override async update(
    id: string,
    data: UpdateQuery<IBooking>,
    session?: ClientSession,
  ): Promise<IBooking | null> {
    await BookingModel.findByIdAndUpdate(id, data, { new: true, session });
    return BookingModel.findById(id)
      .populate(this.populateOptions)
      .session(session || null)
      .exec();
  }
}
