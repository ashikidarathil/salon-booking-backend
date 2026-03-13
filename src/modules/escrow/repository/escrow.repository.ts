import { IEscrow, EscrowModel, EscrowStatus } from '../../../models/escrow.model';
import { IEscrowRepository } from './IEscrowRepository';
import { injectable, inject } from 'tsyringe';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import {
  PaginationQueryDto,
  PaginationQueryParser,
} from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { BookingModel } from '../../../models/booking.model';
import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { ServiceModel } from '../../../models/service.model';
import {
  toObjectId,
  PopulateOptions,
  UpdateQuery,
  ClientSession,
} from '../../../common/utils/mongoose.util';
import { SortOptions } from '../../../common/repository/baseRepository';

@injectable()
export class EscrowRepository
  extends PaginatedBaseRepository<IEscrow, IEscrow>
  implements IEscrowRepository
{
  constructor(@inject(TOKENS.QueryBuilder) queryBuilder: QueryBuilderService) {
    super(EscrowModel, queryBuilder);
  }

  protected toEntity(doc: IEscrow): IEscrow {
    return doc;
  }

  async findByBookingId(bookingId: string): Promise<IEscrow | null> {
    return this._model
      .findOne({ bookingId: toObjectId(bookingId) })
      .lean<IEscrow>()
      .exec();
  }

  async find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IEscrow[]> {
    let query = this._model.find(filter);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort as string | { [key: string]: 1 | -1 | 'asc' | 'desc' });
    return query.lean<IEscrow[]>().exec();
  }

  async create(data: Partial<IEscrow>, session?: ClientSession): Promise<IEscrow> {
    const doc = new this._model(data);
    const savedDoc = await doc.save({ session });
    return savedDoc.toObject() as IEscrow;
  }

  async updateStatus(
    id: string,
    status: EscrowStatus,
    session?: ClientSession,
  ): Promise<IEscrow | null> {
    return this._model
      .findByIdAndUpdate(id, { status }, { new: true, session })
      .lean<IEscrow>()
      .exec();
  }

  override async update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IEscrow>,
    populate?: PopulateOptions[],
  ): Promise<IEscrow | null> {
    let query = this._model.findOneAndUpdate(filter, data, { new: true });
    if (populate) query = query.populate(populate);
    return query.lean<IEscrow>().exec();
  }

  async findHeldBeforeMonth(currentMonth: string): Promise<IEscrow[]> {
    return this._model
      .find({
        status: EscrowStatus.HELD,
        releaseMonth: { $lt: currentMonth },
      })
      .lean<IEscrow[]>()
      .exec();
  }

  async findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<IEscrow>> {
    const { search, filters } = PaginationQueryParser.parse(query);
    const complexFilter: Record<string, any> = { ...filters };

    if (search) {
      const regex = new RegExp(search, 'i');

      const matchingBookings = await BookingModel.find({
        bookingNumber: regex,
      })
        .select('_id')
        .lean();
      const bookingIds = matchingBookings.map((b) => b._id);

      const matchingUsers = await UserModel.find({
        name: regex,
      })
        .select('_id')
        .lean();
      const userIds = matchingUsers.map((u) => u._id);

      const matchingStylists = await StylistModel.find({
        userId: { $in: userIds },
      })
        .select('_id')
        .lean();
      const stylistIds = matchingStylists.map((s) => s._id);

      complexFilter.$or = [{ bookingId: { $in: bookingIds } }, { stylistId: { $in: stylistIds } }];

      const customersAsBookings = await BookingModel.find({
        userId: { $in: userIds },
      })
        .select('_id')
        .lean();
      if (customersAsBookings.length > 0) {
        complexFilter.$or.push({
          bookingId: { $in: customersAsBookings.map((b) => b._id) },
        });
      }
    }

    return this._queryBuilder.paginate(
      this._model,
      { ...query, search: undefined, ...complexFilter },
      [],
      (doc) => this.toEntity(doc),
      [
        {
          path: 'bookingId',
          populate: [
            { path: 'userId', select: 'name' },
            { path: 'items.serviceId', select: 'name' },
          ],
        },
        {
          path: 'stylistId',
          populate: { path: 'userId', select: 'name' },
        },
      ],
    );
  }
}
