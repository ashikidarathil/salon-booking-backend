import { inject, injectable } from 'tsyringe';
import { ICouponService } from './ICouponService';
import { ICouponRepository } from '../repository/ICouponRepository';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import {
  CreateCouponRequestDto,
  UpdateCouponRequestDto,
  CouponPaginationQueryDto,
} from '../dto/coupon.request.dto';
import { CouponResponseDto } from '../dto/coupon.response.dto';
import { CouponMapper } from '../mapper/coupon.mapper';
import { COUPON_MESSAGES } from '../constants/coupon.messages';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';
import { ICoupon } from '../../../models/coupon.model';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { CreateCouponSchema, UpdateCouponSchema } from '../dto/coupon.schema';

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject(TOKENS.CouponRepository)
    private couponRepository: ICouponRepository,
  ) {}

  async createCoupon(data: CreateCouponRequestDto): Promise<CouponResponseDto> {
    const validatedData = CreateCouponSchema.parse(data);

    const existing = await this.couponRepository.findByCode(validatedData.code);
    if (existing) {
      throw new AppError(COUPON_MESSAGES.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const couponData: Partial<ICoupon> = {
      ...validatedData,
      applicableServices: validatedData.applicableServices?.map((id: string) => toObjectId(id)),
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

    const validatedData = UpdateCouponSchema.parse(data);

    if (validatedData.code && validatedData.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepository.findByCode(validatedData.code);
      if (existing) {
        throw new AppError(COUPON_MESSAGES.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
      }
    }

    const updateData: Partial<ICoupon> = { ...validatedData } as Partial<ICoupon>;
    if (validatedData.applicableServices) {
      updateData.applicableServices = validatedData.applicableServices.map((sid: string) =>
        toObjectId(sid),
      );
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

  async listCoupons(
    query: CouponPaginationQueryDto,
  ): Promise<PaginatedResponse<CouponResponseDto>> {
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
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new AppError(COUPON_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const updated = await this.couponRepository.update(
      { _id: toObjectId(id) },
      { isActive: !coupon.isActive },
    );
    if (!updated) {
      throw new AppError(COUPON_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return CouponMapper.toResponseDto(updated);
  }

  async toggleDeleteStatus(id: string): Promise<CouponResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(COUPON_MESSAGES.INVALID_INPUT, HttpStatus.BAD_REQUEST);
    }
    const coupon = await this.couponRepository.findById(id);
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
