import { ICoupon, CouponModel, CouponFilterStatus } from '../../../models/coupon.model';
import { ICouponRepository } from './ICouponRepository';
import { injectable, inject } from 'tsyringe';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';
import { CouponPaginationQueryDto } from '../dto/coupon.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { toObjectId, UpdateQuery } from '../../../common/utils/mongoose.util';

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
    const filter: Record<string, unknown> = { ...rest, isDeleted: false };

    if (status === CouponFilterStatus.ACTIVE) {
      filter.isActive = true;
    } else if (status === CouponFilterStatus.INACTIVE) {
      filter.isActive = false;
    } else if (status === CouponFilterStatus.DELETED) {
      filter.isDeleted = true;
    }

    return this.getPaginated(filter as unknown as CouponPaginationQueryDto);
  }

  async findPaginated(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>> {
    return this.getPaginatedCoupons(query);
  }

  protected toEntity(doc: ICoupon): ICoupon {
    return doc;
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return this._model
      .findOne({ code: code.toUpperCase(), isDeleted: false })
      .lean<ICoupon>()
      .exec();
  }

  async incrementUsedCount(id: string): Promise<ICoupon | null> {
    return this.update({ _id: toObjectId(id) }, { $inc: { usedCount: 1 } } as UpdateQuery<ICoupon>);
  }

  async create(data: Partial<ICoupon>): Promise<ICoupon> {
    const doc = new this._model(data);
    const savedDoc = await doc.save();
    return this.toEntity(savedDoc as ICoupon);
  }

  async findAvailable(): Promise<ICoupon[]> {
    return this._model
      .find({
        isActive: true,
        isDeleted: false,
        expiryDate: { $gt: new Date() },
        $expr: { $lt: ['$usedCount', '$maxUsage'] },
      })
      .lean<ICoupon[]>()
      .exec();
  }
}
