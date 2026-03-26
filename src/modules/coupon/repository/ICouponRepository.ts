import { ICoupon } from '../../../models/coupon.model';
import { CouponPaginationQueryDto } from '../dto/coupon.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PopulateOptions, UpdateQuery } from '../../../common/utils/mongoose.util';

export interface ICouponRepository {
  findByCode(code: string): Promise<ICoupon | null>;
  incrementUsedCount(id: string): Promise<ICoupon | null>;
  findPaginated(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>>;
  findAvailable(): Promise<ICoupon[]>;
  getPaginatedCoupons(query: CouponPaginationQueryDto): Promise<PaginatedResponse<ICoupon>>;
  findById(id: string, populate?: (string | PopulateOptions)[]): Promise<ICoupon | null>;
  update(
    filter: Record<string, unknown>,
    data: UpdateQuery<ICoupon>,
    populate?: (string | PopulateOptions)[],
  ): Promise<ICoupon | null>;
  create(data: Partial<ICoupon>): Promise<ICoupon>;
}
