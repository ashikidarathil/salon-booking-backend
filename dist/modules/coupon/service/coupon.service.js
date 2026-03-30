"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const coupon_mapper_1 = require("../mapper/coupon.mapper");
const coupon_messages_1 = require("../constants/coupon.messages");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const coupon_schema_1 = require("../dto/coupon.schema");
let CouponService = class CouponService {
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async createCoupon(data) {
        const validatedData = coupon_schema_1.CreateCouponSchema.parse(data);
        const existing = await this.couponRepository.findByCode(validatedData.code);
        if (existing) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.ALREADY_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const couponData = {
            ...validatedData,
            applicableServices: validatedData.applicableServices?.map((id) => (0, mongoose_util_1.toObjectId)(id)),
        };
        const coupon = await this.couponRepository.create(couponData);
        return coupon_mapper_1.CouponMapper.toResponseDto(coupon);
    }
    async updateCoupon(id, data) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.INVALID_INPUT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const validatedData = coupon_schema_1.UpdateCouponSchema.parse(data);
        if (validatedData.code && validatedData.code.toUpperCase() !== coupon.code) {
            const existing = await this.couponRepository.findByCode(validatedData.code);
            if (existing) {
                throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.ALREADY_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updateData = { ...validatedData };
        if (validatedData.applicableServices) {
            updateData.applicableServices = validatedData.applicableServices.map((sid) => (0, mongoose_util_1.toObjectId)(sid));
        }
        const updated = await this.couponRepository.update({ _id: (0, mongoose_util_1.toObjectId)(id) }, updateData);
        if (!updated) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return coupon_mapper_1.CouponMapper.toResponseDto(updated);
    }
    async incrementUsedCount(id) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.INVALID_INPUT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const updated = await this.couponRepository.incrementUsedCount(id);
        if (!updated) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateCoupon(code, bookingAmount) {
        const coupon = await this.couponRepository.findByCode(code);
        if (!coupon) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (!coupon.isActive) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.INACTIVE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (new Date() > coupon.expiryDate) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.EXPIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (coupon.usedCount >= coupon.maxUsage) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.LIMIT_REACHED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (bookingAmount < coupon.minBookingAmount) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.MIN_AMOUNT_NOT_MET(coupon.minBookingAmount), httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        return coupon_mapper_1.CouponMapper.toResponseDto(coupon);
    }
    async listAvailableCoupons() {
        const coupons = await this.couponRepository.findAvailable();
        return coupon_mapper_1.CouponMapper.toResponseListDto(coupons);
    }
    async listCoupons(query) {
        const paginatedCoupons = await this.couponRepository.getPaginatedCoupons(query);
        return {
            data: coupon_mapper_1.CouponMapper.toResponseListDto(paginatedCoupons.data),
            pagination: paginatedCoupons.pagination,
        };
    }
    async toggleCouponStatus(id) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.INVALID_INPUT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.couponRepository.update({ _id: (0, mongoose_util_1.toObjectId)(id) }, { isActive: !coupon.isActive });
        if (!updated) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return coupon_mapper_1.CouponMapper.toResponseDto(updated);
    }
    async toggleDeleteStatus(id) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.INVALID_INPUT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const isDeleting = !coupon.isDeleted;
        const updateData = { isDeleted: isDeleting };
        if (isDeleting) {
            updateData.isActive = false;
        }
        const updated = await this.couponRepository.update({ _id: (0, mongoose_util_1.toObjectId)(id) }, updateData);
        if (!updated) {
            throw new appError_1.AppError(coupon_messages_1.COUPON_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return coupon_mapper_1.CouponMapper.toResponseDto(updated);
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.CouponRepository)),
    __metadata("design:paramtypes", [Object])
], CouponService);
