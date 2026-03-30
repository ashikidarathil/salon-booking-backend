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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRepository = void 0;
const wishlist_model_1 = require("../../../models/wishlist.model");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const tsyringe_1 = require("tsyringe");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let WishlistRepository = class WishlistRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(wishlist_model_1.WishlistModel);
    }
    toEntity(doc) {
        return doc;
    }
    async deleteOne(filter) {
        const result = await wishlist_model_1.WishlistModel.deleteOne(filter);
        return result.deletedCount > 0;
    }
    async getFavoritesSet(userId, stylistIds) {
        const favorites = await wishlist_model_1.WishlistModel.find({
            userId: (0, mongoose_util_1.toObjectId)(userId),
            stylistId: { $in: stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id)) },
        })
            .select('stylistId')
            .lean();
        return new Set(favorites.map((f) => f.stylistId.toString()));
    }
};
exports.WishlistRepository = WishlistRepository;
exports.WishlistRepository = WishlistRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WishlistRepository);
