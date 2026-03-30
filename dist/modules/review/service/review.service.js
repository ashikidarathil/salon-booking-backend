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
exports.ReviewService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const review_mapper_1 = require("../mapper/review.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_model_1 = require("../../../models/booking.model");
const notification_model_1 = require("../../../models/notification.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const review_messages_1 = require("../constants/review.messages");
let ReviewService = class ReviewService {
    constructor(_reviewRepo, _bookingRepo, _notificationService, _mapper, _stylistRepo, _serviceRepo) {
        this._reviewRepo = _reviewRepo;
        this._bookingRepo = _bookingRepo;
        this._notificationService = _notificationService;
        this._mapper = _mapper;
        this._stylistRepo = _stylistRepo;
        this._serviceRepo = _serviceRepo;
    }
    async createReview(userId, dto) {
        const booking = await this._bookingRepo.findById(dto.bookingId);
        if (!booking) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const bookingUserId = (0, mongoose_util_1.getIdString)(booking.userId);
        if (bookingUserId !== userId) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (booking.status !== booking_model_1.BookingStatus.COMPLETED) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.NOT_COMPLETED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const existingReview = await this._reviewRepo.findByBookingId(dto.bookingId);
        if (existingReview) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.ALREADY_REVIEWED, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        const stylistId = (0, mongoose_util_1.getIdString)(booking.stylistId);
        const serviceId = (0, mongoose_util_1.getIdString)(booking.items[0].serviceId);
        const review = await this._reviewRepo.createReview({
            ...dto,
            userId,
            stylistId,
            serviceId,
        });
        // Notify Stylist
        await this._notificationService.createNotification({
            recipientId: stylistId,
            title: 'New Review Received',
            message: `A client left a ${dto.rating}-star review for your service.`,
            type: notification_model_1.NotificationType.SYSTEM,
        });
        // Update Stylist Stats
        const stylistStats = await this.getStylistRating(stylistId);
        await this._stylistRepo.update(stylistId, {
            rating: stylistStats.averageRating,
            reviewCount: stylistStats.totalReviews,
        });
        // Update Service Stats
        const serviceStats = await this.getServiceRating(serviceId);
        await this._serviceRepo.update(serviceId, {
            rating: serviceStats.averageRating,
            reviewCount: serviceStats.totalReviews,
        });
        return this._mapper.toDto(review);
    }
    async getReviewById(id) {
        const review = await this._reviewRepo.findById(id);
        if (!review)
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return review;
    }
    async listReviews(query) {
        const { reviews, total } = await this._reviewRepo.listReviews(query);
        return {
            reviews: this._mapper.toDtoList(reviews),
            total,
        };
    }
    async getStylistRating(stylistId) {
        return this._reviewRepo.getStylistRating(stylistId);
    }
    async getServiceRating(serviceId) {
        return this._reviewRepo.getServiceRating(serviceId);
    }
    async getTopStylists(limit = 5) {
        return this._reviewRepo.getTopStylists(limit);
    }
    async getTopServices(limit = 5) {
        return this._reviewRepo.getTopServices(limit);
    }
    async deleteReview(id) {
        const review = await this._reviewRepo.findById(id);
        if (!review) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        await this._reviewRepo.softDeleteReview(id);
        // Recalculate Stylist Stats
        const stylistId = (0, mongoose_util_1.getIdString)(review.stylistId);
        const stylistStats = await this.getStylistRating(stylistId);
        await this._stylistRepo.update(stylistId, {
            rating: stylistStats.averageRating,
            reviewCount: stylistStats.totalReviews,
        });
        // Recalculate Service Stats
        const serviceId = (0, mongoose_util_1.getIdString)(review.serviceId);
        const serviceStats = await this.getServiceRating(serviceId);
        await this._serviceRepo.update(serviceId, {
            rating: serviceStats.averageRating,
            reviewCount: serviceStats.totalReviews,
        });
    }
    async restoreReview(id) {
        const review = await this._reviewRepo.findById(id);
        if (!review) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        await this._reviewRepo.restoreReview(id);
        // Recalculate Stylist Stats
        const stylistId = (0, mongoose_util_1.getIdString)(review.stylistId);
        const stylistStats = await this.getStylistRating(stylistId);
        await this._stylistRepo.update(stylistId, {
            rating: stylistStats.averageRating,
            reviewCount: stylistStats.totalReviews,
        });
        // Recalculate Service Stats
        const serviceId = (0, mongoose_util_1.getIdString)(review.serviceId);
        const serviceStats = await this.getServiceRating(serviceId);
        await this._serviceRepo.update(serviceId, {
            rating: serviceStats.averageRating,
            reviewCount: serviceStats.totalReviews,
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ReviewRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.ReviewMapper)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.ServiceRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, review_mapper_1.ReviewMapper, Object, Object])
], ReviewService);
