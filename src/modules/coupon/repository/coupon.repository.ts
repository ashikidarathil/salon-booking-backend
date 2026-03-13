import { ICoupon, CouponModel } from '../../../models/coupon.model';
import { ICouponRepository } from './ICouponRepository';
import { injectable, inject } from 'tsyringe';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import { CouponPaginationQueryDto } from '../dto/coupon.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { toObjectId, PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';
import { SortOptions } from '../../../common/repository/baseRepository';

@injectable()
export class CouponRepository
  extends PaginatedBaseRepository<ICoupon, ICoupon>
  implements ICouponRepository
{
  constructor(@inject(TOKENS.QueryBuilder) queryBuilder: QueryBuilderService) {
    super(CouponModel, queryBuilder);
  }

  protected getSearchableFields(): readonly (keyof ICoupon & string)[] {
    return ['code'];
  }

  async getPaginatedCoupons(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>> {
    const { status, ...rest } = query;
    const filter: Record<string, unknown> = { ...rest };

    if (status === 'ACTIVE') {
      filter.isActive = true;
      filter.isDeleted = false;
    } else if (status === 'INACTIVE') {
      filter.isActive = false;
      filter.isDeleted = false;
    } else if (status === 'DELETED') {
      filter.isDeleted = true;
    }

    return this.getPaginated(filter as any);
  }

  async findPaginated(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>> {
    return this.getPaginatedCoupons(query);
  }

  protected toEntity(doc: ICoupon): ICoupon {
    return doc;
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return this._model.findOne({ code: code.toUpperCase() }).lean<ICoupon>().exec();
  }

  async incrementUsedCount(id: string, session?: ClientSession): Promise<ICoupon | null> {
    return this.update({ _id: toObjectId(id) }, { $inc: { usedCount: 1 } } as UpdateQuery<ICoupon>, [], session);
  }

  override async findById(id: string): Promise<ICoupon | null> {
    return this._model.findOne({ _id: toObjectId(id), isDeleted: false }).lean<ICoupon>().exec();
  }

  async find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<ICoupon[]> {
    let query = this._model.find(filter);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort as string | { [key: string]: 1 | -1 | 'asc' | 'desc' });
    return query.lean<ICoupon[]>().exec();
  }

  async findByIdRaw(id: string): Promise<ICoupon | null> {
    return this._model.findById(id).lean<ICoupon>().exec();
  }

  async findAvailable(): Promise<ICoupon[]> {
    return this._model.find({
      isActive: true,
      isDeleted: false,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ['$usedCount', '$maxUsage'] },
    }).lean<ICoupon[]>().exec();
  }

  async create(data: Partial<ICoupon>, session?: ClientSession): Promise<ICoupon> {
    const doc = new this._model(data);
    const savedDoc = await doc.save({ session });
    return savedDoc.toObject() as ICoupon;
  }

  override async update(
    filter: Record<string, unknown>,
    data: UpdateQuery<ICoupon>,
    populate?: PopulateOptions[],
    session?: ClientSession,
  ): Promise<ICoupon | null> {
    let query = this._model.findOneAndUpdate(filter, data, { new: true, session });
    if (populate) query = query.populate(populate);
    return query.lean<ICoupon>().exec();
  }
}
