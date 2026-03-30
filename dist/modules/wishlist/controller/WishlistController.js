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
exports.WishlistController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const WishlistService_1 = require("../service/WishlistService");
const wishlist_constants_1 = require("../constants/wishlist.constants");
let WishlistController = class WishlistController {
    constructor(_service) {
        this._service = _service;
        this.toggle = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId) {
                return apiResponse_1.ApiResponse.error(res, wishlist_constants_1.WISHLIST_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const { stylistId } = req.body;
            if (!stylistId) {
                return apiResponse_1.ApiResponse.error(res, wishlist_constants_1.WISHLIST_MESSAGES.STYLIST_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const isAdded = await this._service.toggleFavorite(userId, stylistId);
            const message = isAdded ? wishlist_constants_1.WISHLIST_MESSAGES.ADDED : wishlist_constants_1.WISHLIST_MESSAGES.REMOVED;
            return apiResponse_1.ApiResponse.success(res, { isAdded }, message);
        };
        this.getMyFavorites = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId) {
                return apiResponse_1.ApiResponse.error(res, wishlist_constants_1.WISHLIST_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const { branchId } = req.query;
            const favorites = await this._service.getMyFavorites(userId, branchId);
            return apiResponse_1.ApiResponse.success(res, favorites, wishlist_constants_1.WISHLIST_MESSAGES.RETRIEVED);
        };
    }
};
exports.WishlistController = WishlistController;
exports.WishlistController = WishlistController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.WishlistService)),
    __metadata("design:paramtypes", [WishlistService_1.WishlistService])
], WishlistController);
