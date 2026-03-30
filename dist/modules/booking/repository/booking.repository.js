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
exports.BookingRepository = void 0;
const booking_model_1 = require("../../../models/booking.model");
const tsyringe_1 = require("tsyringe");
const paginatedBaseRepository_1 = require("../../../common/repository/paginatedBaseRepository");
const tokens_1 = require("../../../common/di/tokens");
const queryBuilder_service_1 = require("../../../common/service/queryBuilder/queryBuilder.service");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let BookingRepository = class BookingRepository extends paginatedBaseRepository_1.PaginatedBaseRepository {
    constructor(queryBuilder) {
        super(booking_model_1.BookingModel, queryBuilder);
        this.defaultPopulateOptions = [
            { path: 'userId', select: 'name' },
            {
                path: 'stylistId',
                select: 'profilePicture',
                populate: { path: 'userId', select: 'name' },
            },
            { path: 'items.serviceId', select: 'name imageUrl' },
            {
                path: 'items.stylistId',
                populate: { path: 'userId', select: 'name' },
            },
        ];
    }
    convertRef(ref) {
        if (!ref)
            return '';
        if (typeof ref === 'object' && '_id' in ref) {
            return ref;
        }
        return ref.toString();
    }
    toEntity(doc) {
        return {
            id: doc._id.toString(),
            bookingNumber: doc.bookingNumber,
            userId: this.convertRef(doc.userId),
            branchId: doc.branchId.toString(),
            slotId: doc.slotId?.toString(),
            items: doc.items.map((item) => ({
                serviceId: this.convertRef(item.serviceId),
                stylistId: this.convertRef(item.stylistId),
                price: item.price,
                duration: item.duration,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
            })),
            stylistId: this.convertRef(doc.stylistId),
            date: doc.date,
            startTime: doc.startTime,
            endTime: doc.endTime,
            totalPrice: doc.totalPrice,
            discountAmount: doc.discountAmount,
            payableAmount: doc.payableAmount,
            advanceAmount: doc.advanceAmount,
            couponId: this.convertRef(doc.couponId),
            status: doc.status,
            paymentStatus: doc.paymentStatus,
            notes: doc.notes,
            cancelledBy: doc.cancelledBy,
            cancelledReason: doc.cancelledReason,
            cancelledAt: doc.cancelledAt,
            completedAt: doc.completedAt,
            rescheduleCount: doc.rescheduleCount,
            rescheduleReason: doc.rescheduleReason,
            paymentWindowExpiresAt: doc.paymentWindowExpiresAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    async findPaginated(query) {
        return this.getPaginated(query, this.defaultPopulateOptions);
    }
    async findById(id) {
        const doc = await this._model
            .findById((0, mongoose_util_1.toObjectId)(id))
            .populate(this.defaultPopulateOptions)
            .exec();
        return doc ? this.toEntity(doc) : null;
    }
    async find(filter, populate = this.defaultPopulateOptions, sort = { createdAt: -1 }) {
        const docs = await this._model
            .find(filter)
            .populate(populate)
            .sort(sort)
            .exec();
        return docs.map((doc) => this.toEntity(doc));
    }
    async findOne(filter, populate = this.defaultPopulateOptions) {
        const doc = await this._model.findOne(filter).populate(populate).exec();
        return doc ? this.toEntity(doc) : null;
    }
    async update(filter, data, populate = this.defaultPopulateOptions, session) {
        const query = this._model.findOneAndUpdate(filter, data, { new: true, session });
        if (populate)
            query.populate(populate);
        const doc = await query.exec();
        return doc ? this.toEntity(doc) : null;
    }
    async create(data, session) {
        const doc = new this._model(data);
        const savedDoc = await (session ? doc.save({ session }) : doc.save());
        const populated = await this.findById(savedDoc._id.toString());
        if (!populated) {
            return this.toEntity(savedDoc);
        }
        return populated;
    }
    async count(filter) {
        return this._model.countDocuments(filter).exec();
    }
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.QueryBuilder)),
    __metadata("design:paramtypes", [queryBuilder_service_1.QueryBuilderService])
], BookingRepository);
