import { CouponResponseDto, CreateCouponRequestDto } from '../dto/coupon.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface ICouponService {
  createCoupon(data: CreateCouponRequestDto): Promise<CouponResponseDto>;
  updateCoupon(id: string, data: Partial<CreateCouponRequestDto>): Promise<CouponResponseDto>;
  validateCoupon(code: string, bookingAmount: number): Promise<CouponResponseDto>;
  listAvailableCoupons(): Promise<CouponResponseDto[]>;
  listCoupons(query: PaginationQueryDto): Promise<PaginatedResponse<CouponResponseDto>>;
  toggleCouponStatus(id: string): Promise<CouponResponseDto>;
  toggleDeleteStatus(id: string): Promise<CouponResponseDto>;
  incrementUsedCount(id: string): Promise<void>;
}
