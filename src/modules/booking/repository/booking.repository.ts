import { IBooking, BookingModel } from '../../../models/booking.model';
import { IBookingRepository } from './IBookingRepository';
import { injectable, inject } from 'tsyringe';
import { ClientSession, UpdateQuery, PopulateOptions } from 'mongoose';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

@injectable()
export class BookingRepository
  extends PaginatedBaseRepository<IBooking, IBooking>
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

  constructor(@inject(TOKENS.QueryBuilder) queryBuilder: QueryBuilderService) {
    super(BookingModel, queryBuilder);
  }

  protected toEntity(doc: IBooking): IBooking {
    return doc;
  }

  async findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<IBooking>> {
    return this.getPaginated(query, this.populateOptions);
  }

  override async findById(id: string): Promise<IBooking | null> {
    return this._model.findById(id).populate(this.populateOptions).lean<IBooking>().exec();
  }

  async find(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.populateOptions,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<IBooking[]> {
    return this._model.find(filter).populate(populate).sort(sort).lean<IBooking[]>().exec();
  }

  override async update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IBooking>,
    populate: (string | PopulateOptions)[] = this.populateOptions,
  ): Promise<IBooking | null> {
    return super.update(filter, data, populate);
  }

  async create(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking> {
    const doc = new this._model(data);
    const savedDoc = await doc.save({ session });
    return this.findById(savedDoc._id.toString()) as Promise<IBooking>;
  }
}
