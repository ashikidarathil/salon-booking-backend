import { IBooking, BookingModel } from '../../../models/booking.model';
import { IBookingRepository } from './IBookingRepository';
import { injectable, inject } from 'tsyringe';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { BookingEntity, BookingRef } from '../../../common/types/bookingEntity';
import {
  toObjectId,
  ObjectId,
  PopulateOptions,
  UpdateQuery,
  ClientSession,
} from '../../../common/utils/mongoose.util';

@injectable()
export class BookingRepository
  extends PaginatedBaseRepository<IBooking, BookingEntity>
  implements IBookingRepository
{
  private readonly defaultPopulateOptions: PopulateOptions[] = [
    { path: 'userId', select: 'name' },
    {
      path: 'stylistId',
      select: 'profilePicture',
      populate: { path: 'userId', select: 'name' },
    },
    { path: 'items.serviceId', select: 'name imageUrl' },
    {
      path: 'items.stylistId',
      populate: { path: 'userId', select: 'name' },
    },
  ];

  constructor(@inject(TOKENS.QueryBuilder) queryBuilder: QueryBuilderService) {
    super(BookingModel, queryBuilder);
  }

  private convertRef<T>(ref: BookingRef | ObjectId | undefined): string | T {
    if (!ref) return '';
    if (typeof ref === 'object' && '_id' in ref) {
      return ref as unknown as T;
    }
    return ref.toString();
  }

  protected toEntity(doc: IBooking): BookingEntity {
    return {
      id: doc._id.toString(),
      bookingNumber: doc.bookingNumber,
      userId: this.convertRef(doc.userId),
      branchId: doc.branchId.toString(),
      slotId: doc.slotId?.toString(),
      items: doc.items.map((item) => ({
        serviceId: this.convertRef(item.serviceId),
        stylistId: this.convertRef(item.stylistId),
        price: item.price,
        duration: item.duration,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
      stylistId: this.convertRef(doc.stylistId),
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      totalPrice: doc.totalPrice,
      discountAmount: doc.discountAmount,
      payableAmount: doc.payableAmount,
      advanceAmount: doc.advanceAmount,
      couponId: this.convertRef(doc.couponId),
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      notes: doc.notes,
      cancelledBy: doc.cancelledBy,
      cancelledReason: doc.cancelledReason,
      cancelledAt: doc.cancelledAt,
      completedAt: doc.completedAt,
      rescheduleCount: doc.rescheduleCount,
      rescheduleReason: doc.rescheduleReason,
      paymentWindowExpiresAt: doc.paymentWindowExpiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<BookingEntity>> {
    return this.getPaginated(query, this.defaultPopulateOptions);
  }

  override async findById(id: string): Promise<BookingEntity | null> {
    const doc = await this._model
      .findById(toObjectId(id))
      .populate(this.defaultPopulateOptions)
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async find(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<BookingEntity[]> {
    const docs = await this._model
      .find(filter)
      .populate(populate)
      .sort(sort as Record<string, 1 | -1>)
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  override async findOne(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
  ): Promise<BookingEntity | null> {
    const doc = await this._model.findOne(filter).populate(populate).exec();
    return doc ? this.toEntity(doc) : null;
  }

  override async update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IBooking>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
    session?: ClientSession,
  ): Promise<BookingEntity | null> {
    const query = this._model.findOneAndUpdate(filter, data, { new: true, session });
    if (populate) query.populate(populate);
    const doc = await query.exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(data: Partial<IBooking>, session?: ClientSession): Promise<BookingEntity> {
    const doc = new this._model(data);
    const savedDoc = await (session ? doc.save({ session }) : doc.save());
    const populated = await this.findById(savedDoc._id.toString());
    if (!populated) {
      return this.toEntity(savedDoc);
    }
    return populated;
  }

  async count(filter: Record<string, unknown>): Promise<number> {
    return this._model.countDocuments(filter).exec();
  }
}
