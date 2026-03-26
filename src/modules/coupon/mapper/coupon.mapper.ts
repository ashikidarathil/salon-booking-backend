import { ICoupon } from '../../../models/coupon.model';
import { CouponResponseDto } from '../dto/coupon.response.dto';

export class CouponMapper {
  static toResponseDto(coupon: ICoupon): CouponResponseDto {
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount || 0,
      expiryDate: coupon.expiryDate.toISOString(),
      maxUsage: coupon.maxUsage,
      usedCount: coupon.usedCount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      isActive: coupon.isActive,
      isDeleted: coupon.isDeleted,
      applicableServices: coupon.applicableServices?.map((s) => s.toString()),
      createdAt: coupon.createdAt?.toISOString() ?? '',
      updatedAt: coupon.updatedAt?.toISOString() ?? '',
    };
  }

  static toResponseListDto(coupons: ICoupon[]): CouponResponseDto[] {
    return coupons.map((c) => this.toResponseDto(c));
  }
}
