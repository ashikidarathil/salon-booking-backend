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
exports.WishlistService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const stylistBranch_model_1 = require("../../../models/stylistBranch.model");
let WishlistService = class WishlistService {
    constructor(_wishlistRepo, _stylistBranchRepo) {
        this._wishlistRepo = _wishlistRepo;
        this._stylistBranchRepo = _stylistBranchRepo;
    }
    async toggleFavorite(userId, stylistId) {
        const filter = {
            userId: (0, mongoose_util_1.toObjectId)(userId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
        };
        const existing = await this._wishlistRepo.findOne(filter);
        if (existing) {
            await this._wishlistRepo.deleteOne(filter);
            return false; // Removed
        }
        else {
            await this._wishlistRepo.create(filter);
            return true; // Added
        }
    }
    async getMyFavorites(userId, branchId) {
        const list = await this._wishlistRepo.find({ userId: (0, mongoose_util_1.toObjectId)(userId) });
        const stylistIds = list.map((doc) => doc.stylistId.toString());
        if (!branchId || stylistIds.length === 0) {
            return stylistIds;
        }
        // Filter by branch
        const branchStylists = await stylistBranch_model_1.StylistBranchModel.find({
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            stylistId: { $in: stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id)) },
            isActive: true,
        })
            .select('stylistId')
            .lean();
        return branchStylists.map((bs) => bs.stylistId.toString());
    }
    async isFavorite(userId, stylistId) {
        const count = await this._wishlistRepo.count({
            userId: (0, mongoose_util_1.toObjectId)(userId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
        });
        return count > 0;
    }
    async getFavoritesForStylists(userId, stylistIds) {
        return this._wishlistRepo.getFavoritesSet(userId, stylistIds);
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.WishlistRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistBranchRepository)),
    __metadata("design:paramtypes", [Object, Object])
], WishlistService);
