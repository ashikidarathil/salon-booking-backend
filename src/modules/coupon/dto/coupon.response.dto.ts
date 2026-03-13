import { DiscountType } from '../../../models/coupon.model';

export interface CouponResponseDto {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  expiryDate: string;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
  isDeleted: boolean;
  applicableServices?: string[];
  createdAt: string;
  updatedAt: string;
}
