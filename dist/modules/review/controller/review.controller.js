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
exports.ReviewController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const review_schema_1 = require("../dto/review.schema");
const review_messages_1 = require("../constants/review.messages");
let ReviewController = class ReviewController {
    constructor(_reviewService) {
        this._reviewService = _reviewService;
    }
    async createReview(req, res) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(review_messages_1.REVIEW_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const dto = review_schema_1.CreateReviewSchema.parse(req.body);
        const review = await this._reviewService.createReview(userId, dto);
        return apiResponse_1.ApiResponse.success(res, review, review_messages_1.REVIEW_MESSAGES.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
    }
    async listReviews(req, res) {
        const query = review_schema_1.ReviewPaginationSchema.parse(req.query);
        const data = await this._reviewService.listReviews(query);
        return apiResponse_1.ApiResponse.success(res, data, review_messages_1.REVIEW_MESSAGES.FETCHED);
    }
    async getStylistRating(req, res) {
        const { stylistId } = req.params;
        const data = await this._reviewService.getStylistRating(stylistId);
        return apiResponse_1.ApiResponse.success(res, data, review_messages_1.REVIEW_MESSAGES.STYLIST_RATING_FETCHED);
    }
    async getTopStylists(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const data = await this._reviewService.getTopStylists(limit);
        return apiResponse_1.ApiResponse.success(res, data, review_messages_1.REVIEW_MESSAGES.FETCHED);
    }
    async getTopServices(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const data = await this._reviewService.getTopServices(limit);
        return apiResponse_1.ApiResponse.success(res, data, review_messages_1.REVIEW_MESSAGES.FETCHED);
    }
    async deleteReview(req, res) {
        const { id } = req.params;
        await this._reviewService.deleteReview(id);
        return apiResponse_1.ApiResponse.success(res, null, review_messages_1.REVIEW_MESSAGES.DELETED);
    }
    async restoreReview(req, res) {
        const { id } = req.params;
        await this._reviewService.restoreReview(id);
        return apiResponse_1.ApiResponse.success(res, null, review_messages_1.REVIEW_MESSAGES.RESTORED);
    }
};
exports.ReviewController = ReviewController;
exports.ReviewController = ReviewController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ReviewService)),
    __metadata("design:paramtypes", [Object])
], ReviewController);
