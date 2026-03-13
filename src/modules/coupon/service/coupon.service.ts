import { inject, injectable } from 'tsyringe';
import { ICouponService } from './ICouponService';
import { ICouponRepository } from '../repository/ICouponRepository';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { CreateCouponRequestDto, UpdateCouponRequestDto, CouponPaginationQueryDto } from '../dto/coupon.request.dto';
import { CouponResponseDto } from '../dto/coupon.response.dto';
import { CouponMapper } from '../mapper/coupon.mapper';
import { COUPON_MESSAGES } from '../constants/coupon.messages';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';
import { ICoupon } from '../../../models/coupon.model';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject(TOKENS.CouponRepository)
    private couponRepository: ICouponRepository,
  ) {}

  async createCoupon(data: CreateCouponRequestDto): Promise<CouponResponseDto> {
    this.validateCouponData(data);
    const existing = await this.couponRepository.findByCode(data.code);
    if (existing) {
      throw new AppError(COUPON_MESSAGES.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const couponData: Partial<ICoupon> = {
      ...data,
      applicableServices: data.applicableServices?.map((id) => toObjectId(id)),
      expiryDate: new Date(data.expiryDate),
    };

    const coupon = await this.couponRepository.create(couponData);
    return CouponMapper.toResponseDto(coupon);
  }

  async updateCoupon(id: string, data: UpdateCouponRequestDto): Promise<CouponResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(COUPON_MESSAGES.INVALID_INPUT, HttpStatus.BAD_REQUEST);
    }

    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new AppError(COUPON_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepository.findByCode(data.code);
      if (existing) {
        throw new AppError(COUPON_MESSAGES.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
      }
    }

    const validationData: CreateCouponRequestDto = {
      code: data.code ?? coupon.code,
      discountType: data.discountType ?? coupon.discountType,
      discountValue: data.discountValue ?? coupon.discountValue,
      minBookingAmount: data.minBookingAmount ?? coupon.minBookingAmount,
      expiryDate: data.expiryDate ?? coupon.expiryDate.toISOString(),
      maxUsage: data.maxUsage ?? coupon.maxUsage,
      applicableServices: data.applicableServices ?? coupon.applicableServices?.map((id) => id.toString()),
    };

    this.validateCouponData(validationData);

    const updateData: any = { ...data };
    if (data.applicableServices) {
      updateData.applicableServices = data.applicableServices.map((sid) => toObjectId(sid));
    }
    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }

    const updated = await this.couponRepository.update({ _id: toObjectId(id) }, updateData);
    if (!updated) {
      throw new AppError(COUPON_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return CouponMapper.toResponseDto(updated);
  }

  async incrementUsedCount(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new AppError(COUPON_MESSAGES.INVALID_INPUT, HttpStatus.BAD_REQUEST);
    }
    const updated = await this.couponRepository.incrementUsedCount(id);
    if (!updated) {
      throw new AppError(COUPON_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private validateCouponData(data: CreateCouponRequestDto) {
    if (!data.code || !/^[A-Z0-9]+$/i.test(data.code)) {
      throw new AppError(
        'Coupon code must be alphanumeric and cannot contain spaces',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.discountValue <= 0) {
      throw new AppError('Discount value must be greater than 0', HttpStatus.BAD_REQUEST);
    }

    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue > 100) {
        throw new AppError('Percentage discount cannot exceed 100%', HttpStatus.BAD_REQUEST);
      }
    }

    if (new Date(data.expiryDate) <= new Date()) {
      throw new AppError('Expiry date must be in the future', HttpStatus.BAD_REQUEST);
    }

    if (data.maxUsage <= 0) {
      throw new AppError('Max usage must be at least 1', HttpStatus.BAD_REQUEST);
    }

    if (data.minBookingAmount === undefined || data.minBookingAmount === null || data.minBookingAmount <= 0) {
      throw new AppError('Minimum booking amount is required and must be greater than 0', HttpStatus.BAD_REQUEST);
    }
  }

  async validateCoupon(code: string, bookingAmount: number): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findByCode(code);

    if (!coupon) {
      throw new AppError(COUPON_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!coupon.isActive) {
      throw new AppError(COUPON_MESSAGES.INACTIVE, HttpStatus.BAD_REQUEST);
    }

    if (new Date() > coupon.expiryDate) {
      throw new AppError(COUPON_MESSAGES.EXPIRED, HttpStatus.BAD_REQUEST);
    }

    if (coupon.usedCount >= coupon.maxUsage) {
      throw new AppError(COUPON_MESSAGES.LIMIT_REACHED, HttpStatus.BAD_REQUEST);
    }

    if (bookingAmount < coupon.minBookingAmount) {
      throw new AppError(
        COUPON_MESSAGES.MIN_AMOUNT_NOT_MET(coupon.minBookingAmount),
        HttpStatus.BAD_REQUEST,
      );
    }

    return CouponMapper.toResponseDto(coupon);
  }

  async listAvailableCoupons(): Promise<CouponResponseDto[]> {
    const coupons = await this.couponRepository.findAvailable();
    return CouponMapper.toResponseListDto(coupons);
  }

  async listCoupons(query: CouponPaginationQueryDto): Promise<PaginatedResponse<CouponResponseDto>> {
    const paginatedCoupons = await this.couponRepository.getPaginatedCoupons(query);
    return {
      data: CouponMapper.toResponseListDto(paginatedCoupons.data),
      pagination: paginatedCoupons.pagination,
    };
  }

  async toggleCouponStatus(id: string): Promise<CouponResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(COUPON_MESSAGES.INVALID_INPUT, HttpStatus.BAD_REQUEST);
    }
    const coupon = await this.couponRepository.findByIdRaw(id);
    if (!coupon) {
      throw new AppError(COUPON_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const updated = await this.couponRepository.update({ _id: toObjectId(id) }, { isActive: !coupon.isActive });
    if (!updated) {
      throw new AppError(COUPON_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return CouponMapper.toResponseDto(updated);
  }

  async toggleDeleteStatus(id: string): Promise<CouponResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(COUPON_MESSAGES.INVALID_INPUT, HttpStatus.BAD_REQUEST);
    }
    const coupon = await this.couponRepository.findByIdRaw(id);
    if (!coupon) {
      throw new AppError(COUPON_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const isDeleting = !coupon.isDeleted;
    const updateData: Partial<ICoupon> = { isDeleted: isDeleting };
    
    if (isDeleting) {
      updateData.isActive = false;
    }

    const updated = await this.couponRepository.update({ _id: toObjectId(id) }, updateData);
    if (!updated) {
      throw new AppError(COUPON_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return CouponMapper.toResponseDto(updated);
  }
}
