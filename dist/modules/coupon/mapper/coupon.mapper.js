"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponMapper = void 0;
class CouponMapper {
    static toResponseDto(coupon) {
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
    static toResponseListDto(coupons) {
        return coupons.map((c) => this.toResponseDto(c));
    }
}
exports.CouponMapper = CouponMapper;
