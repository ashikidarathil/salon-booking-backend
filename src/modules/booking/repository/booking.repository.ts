import { IBooking, BookingModel } from '../../../models/booking.model';
import { IBookingRepository } from './IBookingRepository';
import { injectable, inject } from 'tsyringe';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { toObjectId, PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';

@injectable()
export class BookingRepository
  extends PaginatedBaseRepository<IBooking, IBooking>
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

  protected toEntity(doc: IBooking): IBooking {
    return doc;
  }

  async findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<IBooking>> {
    return this.getPaginated(query, this.defaultPopulateOptions);
  }

  override async findById(id: string): Promise<IBooking | null> {
    return this._model.findById(toObjectId(id)).populate(this.defaultPopulateOptions).lean<IBooking>().exec();
  }

  async find(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<IBooking[]> {
    return this._model.find(filter).populate(populate).sort(sort as any).lean<IBooking[]>().exec();
  }

  override async findOne(
    filter: Record<string, unknown>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
  ): Promise<IBooking | null> {
    return this._model.findOne(filter).populate(populate).lean<IBooking>().exec();
  }

  override async update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IBooking>,
    populate: PopulateOptions[] = this.defaultPopulateOptions,
    session?: ClientSession,
  ): Promise<IBooking | null> {
    const query = this._model.findOneAndUpdate(filter, data, { new: true, session });
    if (populate) query.populate(populate);
    return query.lean<IBooking>().exec();
  }

  async create(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking> {
    const doc = new this._model(data);
    const savedDoc = await (session ? doc.save({ session }) : doc.save());
    // We already have some of the data, but we need population. 
    // Usually, we find it again to get the populated version for the response.
    const populated = await this.findById(savedDoc._id.toString());
    if (!populated) {
      return savedDoc.toObject() as IBooking;
    }
    return populated;
  }

  async count(filter: Record<string, unknown>): Promise<number> {
    return this._model.countDocuments(filter).exec();
  }
}
