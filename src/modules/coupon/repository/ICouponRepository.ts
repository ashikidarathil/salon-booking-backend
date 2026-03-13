import { ICoupon } from '../../../models/coupon.model';
import { SortOptions } from '../../../common/repository/baseRepository';
import { CouponPaginationQueryDto } from '../dto/coupon.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';

export interface ICouponRepository {
  create(data: Partial<ICoupon>, session?: ClientSession): Promise<ICoupon>;
  findById(id: string): Promise<ICoupon | null>;
  findByCode(code: string): Promise<ICoupon | null>;
  update(
    filter: Record<string, unknown>,
    data: UpdateQuery<ICoupon>,
    populate?: PopulateOptions[],
    session?: ClientSession,
  ): Promise<ICoupon | null>;
  incrementUsedCount(id: string, session?: ClientSession): Promise<ICoupon | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<ICoupon[]>;
  findPaginated(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>>;
  findByIdRaw(id: string): Promise<ICoupon | null>;
  findAvailable(): Promise<ICoupon[]>;
  getPaginatedCoupons(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>>;
}
