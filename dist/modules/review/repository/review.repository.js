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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const tsyringe_1 = require("tsyringe");
const review_model_1 = require("../../../models/review.model");
const mongoose_1 = __importDefault(require("mongoose"));
const stylist_model_1 = require("../../../models/stylist.model");
const baseRepository_1 = require("../../../common/repository/baseRepository");
let ReviewRepository = class ReviewRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(review_model_1.ReviewModel);
    }
    toEntity(doc) {
        return doc;
    }
    async createReview(dto) {
        return review_model_1.ReviewModel.create({
            userId: new mongoose_1.default.Types.ObjectId(dto.userId),
            bookingId: new mongoose_1.default.Types.ObjectId(dto.bookingId),
            stylistId: new mongoose_1.default.Types.ObjectId(dto.stylistId),
            serviceId: new mongoose_1.default.Types.ObjectId(dto.serviceId),
            rating: dto.rating,
            comment: dto.comment,
        });
    }
    async findByBookingId(bookingId) {
        return this.findOne({ bookingId: new mongoose_1.default.Types.ObjectId(bookingId), isDeleted: false });
    }
    async listReviews(query) {
        const filter = {};
        if (!query.includeDeleted) {
            filter.isDeleted = false;
        }
        if (query.stylistId) {
            let stylist = await stylist_model_1.StylistModel.findById(query.stylistId);
            if (!stylist) {
                stylist = await stylist_model_1.StylistModel.findOne({ userId: query.stylistId });
            }
            if (stylist) {
                filter.stylistId = stylist._id;
            }
            else {
                try {
                    filter.stylistId = new mongoose_1.default.Types.ObjectId(query.stylistId);
                }
                catch {
                    filter.stylistId = query.stylistId;
                }
            }
        }
        if (query.serviceId)
            filter.serviceId = new mongoose_1.default.Types.ObjectId(query.serviceId);
        if (query.search) {
            filter.comment = { $regex: query.search, $options: 'i' };
        }
        if (query.startDate || query.endDate) {
            filter.createdAt = {};
            if (query.startDate)
                filter.createdAt.$gte = new Date(query.startDate);
            if (query.endDate) {
                const end = new Date(query.endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'desc';
        const total = await this.count(filter);
        const reviews = await this.find(filter, [{ path: 'userId', select: 'name profilePicture' }], {
            [sortBy]: sortOrder === 'desc' ? -1 : 1,
        });
        return { reviews: reviews.slice((page - 1) * limit, page * limit), total };
    }
    async getStylistRating(stylistId) {
        let resolvedStylistId = stylistId;
        const stylist = await stylist_model_1.StylistModel.findOne({ userId: stylistId });
        if (stylist) {
            resolvedStylistId = stylist._id.toString();
        }
        const stats = await this._model.aggregate([
            {
                $match: {
                    stylistId: new mongoose_1.default.Types.ObjectId(resolvedStylistId),
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const result = stats[0] || { averageRating: 0, totalReviews: 0 };
        return {
            averageRating: result.averageRating || 0,
            totalReviews: result.totalReviews || 0,
        };
    }
    async getServiceRating(serviceId) {
        const stats = await this._model.aggregate([
            {
                $match: {
                    serviceId: new mongoose_1.default.Types.ObjectId(serviceId),
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const result = stats[0] || { averageRating: 0, totalReviews: 0 };
        return {
            averageRating: result.averageRating || 0,
            totalReviews: result.totalReviews || 0,
        };
    }
    async getTopStylists(limit) {
        return this._model.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$stylistId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
            { $sort: { averageRating: -1, totalReviews: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'stylists',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stylistInfo',
                },
            },
            { $unwind: '$stylistInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stylistInfo.userId',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 0,
                    stylistId: '$_id',
                    averageRating: 1,
                    totalReviews: 1,
                    stylistName: '$userInfo.name',
                    avatar: '$userInfo.profilePicture',
                    specialization: '$stylistInfo.specialization',
                    bookingCount: '$totalReviews',
                },
            },
        ]);
    }
    async getTopServices(limit) {
        return this._model.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$serviceId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
            { $sort: { averageRating: -1, totalReviews: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'serviceInfo',
                },
            },
            { $unwind: '$serviceInfo' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'serviceInfo.categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            {
                $unwind: {
                    path: '$categoryInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    serviceId: '$_id',
                    averageRating: 1,
                    totalReviews: 1,
                    serviceName: '$serviceInfo.name',
                    imageUrl: '$serviceInfo.imageUrl',
                    description: '$serviceInfo.description',
                    categoryName: '$categoryInfo.name',
                    bookingCount: '$totalReviews',
                },
            },
        ]);
    }
    async softDeleteReview(id) {
        await this.update(id, { isDeleted: true });
    }
    async restoreReview(id) {
        await this.update(id, { isDeleted: false });
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
