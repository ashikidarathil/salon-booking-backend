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
exports.StylistWalletService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistWallet_mapper_1 = require("../mapper/stylistWallet.mapper");
const stylistWallet_messages_1 = require("../constants/stylistWallet.messages");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let StylistWalletService = class StylistWalletService {
    constructor(walletRepository, stylistRepository) {
        this.walletRepository = walletRepository;
        this.stylistRepository = stylistRepository;
    }
    async resolveUserId(id) {
        const stylist = await this.stylistRepository.getById(id);
        if (stylist) {
            return (0, mongoose_util_1.getIdString)(stylist.userId);
        }
        return id;
    }
    async getWallet(id) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(stylistWallet_messages_1.STYLIST_WALLET_MESSAGES.INVALID_ID, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const userId = await this.resolveUserId(id);
        let wallet = await this.walletRepository.findByStylistId(userId);
        if (!wallet) {
            wallet = await this.walletRepository.create({ stylistId: (0, mongoose_util_1.toObjectId)(userId) });
        }
        return stylistWallet_mapper_1.StylistWalletMapper.toWalletDto(wallet);
    }
    async addEarnings(id, amount) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(stylistWallet_messages_1.STYLIST_WALLET_MESSAGES.INVALID_ID, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const userId = await this.resolveUserId(id);
        let wallet = await this.walletRepository.findByStylistId(userId);
        if (!wallet) {
            wallet = await this.walletRepository.create({ stylistId: (0, mongoose_util_1.toObjectId)(userId) });
        }
        await this.walletRepository.updateBalance(userId, {
            withdrawableBalance: amount,
            totalEarnings: amount,
        });
    }
};
exports.StylistWalletService = StylistWalletService;
exports.StylistWalletService = StylistWalletService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistWalletRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __metadata("design:paramtypes", [Object, Object])
], StylistWalletService);
