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
exports.CouponRepository = void 0;
const coupon_model_1 = require("../../../models/coupon.model");
const tsyringe_1 = require("tsyringe");
const paginatedBaseRepository_1 = require("../../../common/repository/paginatedBaseRepository");
const tokens_1 = require("../../../common/di/tokens");
const queryBuilder_service_1 = require("../../../common/service/queryBuilder/queryBuilder.service");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let CouponRepository = class CouponRepository extends paginatedBaseRepository_1.PaginatedBaseRepository {
    constructor(queryBuilder) {
        super(coupon_model_1.CouponModel, queryBuilder);
    }
    getSearchableFields() {
        return ['code'];
    }
    async getPaginatedCoupons(query) {
        const { status, ...rest } = query;
        const filter = { ...rest, isDeleted: false };
        if (status === coupon_model_1.CouponFilterStatus.ACTIVE) {
            filter.isActive = true;
        }
        else if (status === coupon_model_1.CouponFilterStatus.INACTIVE) {
            filter.isActive = false;
        }
        else if (status === coupon_model_1.CouponFilterStatus.DELETED) {
            filter.isDeleted = true;
        }
        return this.getPaginated(filter);
    }
    async findPaginated(query) {
        return this.getPaginatedCoupons(query);
    }
    toEntity(doc) {
        return doc;
    }
    async findByCode(code) {
        return this._model
            .findOne({ code: code.toUpperCase(), isDeleted: false })
            .lean()
            .exec();
    }
    async incrementUsedCount(id) {
        return this.update({ _id: (0, mongoose_util_1.toObjectId)(id) }, { $inc: { usedCount: 1 } });
    }
    async create(data) {
        const doc = new this._model(data);
        const savedDoc = await doc.save();
        return this.toEntity(savedDoc);
    }
    async findAvailable() {
        return this._model
            .find({
            isActive: true,
            isDeleted: false,
            expiryDate: { $gt: new Date() },
            $expr: { $lt: ['$usedCount', '$maxUsage'] },
        })
            .lean()
            .exec();
    }
};
exports.CouponRepository = CouponRepository;
exports.CouponRepository = CouponRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.QueryBuilder)),
    __metadata("design:paramtypes", [queryBuilder_service_1.QueryBuilderService])
], CouponRepository);
