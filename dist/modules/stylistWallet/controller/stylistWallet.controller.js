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
exports.StylistWalletController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const apiResponse_1 = require("../../../common/response/apiResponse");
const stylistWallet_messages_1 = require("../constants/stylistWallet.messages");
const appError_1 = require("../../../common/errors/appError");
let StylistWalletController = class StylistWalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getStylistWallet(req, res) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(stylistWallet_messages_1.STYLIST_WALLET_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const wallet = await this.walletService.getWallet(userId);
        return apiResponse_1.ApiResponse.success(res, wallet, stylistWallet_messages_1.STYLIST_WALLET_MESSAGES.WALLET_RETRIEVED);
    }
    async getWalletByStylistId(req, res) {
        const { stylistId } = req.params;
        const wallet = await this.walletService.getWallet(stylistId);
        return apiResponse_1.ApiResponse.success(res, wallet, stylistWallet_messages_1.STYLIST_WALLET_MESSAGES.WALLET_RETRIEVED);
    }
};
exports.StylistWalletController = StylistWalletController;
exports.StylistWalletController = StylistWalletController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistWalletService)),
    __metadata("design:paramtypes", [Object])
], StylistWalletController);
