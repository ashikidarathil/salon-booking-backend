import { DiscountType, CouponFilterStatus } from '../../../models/coupon.model';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface CreateCouponRequestDto {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  expiryDate: string;
  maxUsage: number;
  maxDiscountAmount: number;
  applicableServices?: string[];
}

export interface UpdateCouponRequestDto extends Partial<CreateCouponRequestDto> {
  isActive?: boolean;
}

export interface ValidateCouponRequestDto {
  code: string;
  amount: number;
}

export interface CouponPaginationQueryDto extends PaginationQueryDto {
  status?: CouponFilterStatus;
}
