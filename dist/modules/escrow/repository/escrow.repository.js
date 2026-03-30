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
exports.EscrowRepository = void 0;
const escrow_model_1 = require("../../../models/escrow.model");
const tsyringe_1 = require("tsyringe");
const paginatedBaseRepository_1 = require("../../../common/repository/paginatedBaseRepository");
const tokens_1 = require("../../../common/di/tokens");
const queryBuilder_service_1 = require("../../../common/service/queryBuilder/queryBuilder.service");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
const booking_model_1 = require("../../../models/booking.model");
const stylist_model_1 = require("../../../models/stylist.model");
const user_model_1 = require("../../../models/user.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let EscrowRepository = class EscrowRepository extends paginatedBaseRepository_1.PaginatedBaseRepository {
    constructor(queryBuilder) {
        super(escrow_model_1.EscrowModel, queryBuilder);
    }
    toEntity(doc) {
        return doc;
    }
    async findByBookingId(bookingId) {
        return this._model
            .findOne({ bookingId: (0, mongoose_util_1.toObjectId)(bookingId) })
            .lean()
            .exec();
    }
    async find(filter, populate, sort) {
        let query = this._model.find(filter);
        if (populate)
            query = query.populate(populate);
        if (sort)
            query = query.sort(sort);
        return query.lean().exec();
    }
    async create(data, session) {
        const doc = new this._model(data);
        const savedDoc = await doc.save({ session });
        return savedDoc.toObject();
    }
    async updateStatus(id, status, session) {
        return this._model
            .findByIdAndUpdate(id, { status }, { new: true, session })
            .lean()
            .exec();
    }
    async update(filter, data, populate) {
        let query = this._model.findOneAndUpdate(filter, data, { new: true });
        if (populate)
            query = query.populate(populate);
        return query.lean().exec();
    }
    async findHeldBeforeDate(date) {
        return this._model
            .find({
            status: escrow_model_1.EscrowStatus.HELD,
            releaseDate: { $lte: date },
        })
            .populate('stylistId')
            .lean()
            .exec();
    }
    async findPaginated(query) {
        const { search, params, sort } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const complexFilter = {};
        // Apply scalar filters
        if (query.status)
            complexFilter.status = query.status;
        if (query.releaseDate)
            complexFilter.releaseDate = query.releaseDate;
        if (query.stylistId)
            complexFilter.stylistId = (0, mongoose_util_1.toObjectId)(query.stylistId);
        // Apply date range filter
        if (query.startDate || query.endDate) {
            const dateFilter = {};
            if (query.startDate)
                dateFilter.$gte = new Date(query.startDate);
            if (query.endDate)
                dateFilter.$lte = new Date(query.endDate);
            complexFilter.createdAt = dateFilter;
        }
        // Apply full-text search by joining related models
        if (search) {
            const regex = new RegExp(search, 'i');
            const matchingBookings = await booking_model_1.BookingModel.find({ bookingNumber: regex })
                .select('_id')
                .lean();
            const bookingIds = matchingBookings.map((b) => b._id);
            const matchingUsers = await user_model_1.UserModel.find({ name: regex }).select('_id').lean();
            const userIds = matchingUsers.map((u) => u._id);
            const matchingStylists = await stylist_model_1.StylistModel.find({ userId: { $in: userIds } })
                .select('_id')
                .lean();
            const stylistIds = matchingStylists.map((s) => s._id);
            complexFilter.$or = [{ bookingId: { $in: bookingIds } }, { stylistId: { $in: stylistIds } }];
            const customersAsBookings = await booking_model_1.BookingModel.find({ userId: { $in: userIds } })
                .select('_id')
                .lean();
            if (customersAsBookings.length > 0) {
                complexFilter.$or.push({ bookingId: { $in: customersAsBookings.map((b) => b._id) } });
            }
        }
        const populateOptions = [
            {
                path: 'bookingId',
                populate: [
                    { path: 'userId', select: 'name' },
                    { path: 'items.serviceId', select: 'name' },
                ],
            },
            {
                path: 'stylistId',
                populate: { path: 'userId', select: 'name' },
            },
        ];
        const [data, totalItems] = await Promise.all([
            this._model
                .find(complexFilter)
                .sort(sort)
                .skip(params.skip)
                .limit(params.limit)
                .populate(populateOptions)
                .lean()
                .exec(),
            this._model.countDocuments(complexFilter),
        ]);
        return pagination_response_dto_1.PaginationResponseBuilder.build(data.map((doc) => this.toEntity(doc)), totalItems, params.page, params.limit);
    }
};
exports.EscrowRepository = EscrowRepository;
exports.EscrowRepository = EscrowRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.QueryBuilder)),
    __metadata("design:paramtypes", [queryBuilder_service_1.QueryBuilderService])
], EscrowRepository);
