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
exports.WalletController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const wallet_messages_1 = require("../constants/wallet.messages");
const wallet_mapper_1 = require("../mapper/wallet.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
        this.getMyWallet = async (req, res) => {
            const userId = req.auth.userId;
            const wallet = await this.walletService.getWalletByUserId(userId);
            return apiResponse_1.ApiResponse.success(res, wallet_mapper_1.WalletMapper.toResponseDto(wallet), wallet_messages_1.WALLET_MESSAGES.FETCH_SUCCESS);
        };
        this.getTransactionHistory = async (req, res) => {
            const userId = req.auth.userId;
            const transactions = await this.walletService.getTransactionHistory(userId);
            return apiResponse_1.ApiResponse.success(res, wallet_mapper_1.WalletMapper.toTransactionListResponseDto(transactions), wallet_messages_1.WALLET_MESSAGES.TRANSACTIONS_FETCH_SUCCESS);
        };
        this.creditMyWallet = async (req, res) => {
            const userId = req.auth.userId;
            const { amount, description } = req.body;
            if (amount <= 0) {
                throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INVALID_AMOUNT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const wallet = await this.walletService.creditBalance(userId, amount, description, undefined, 'DEPOSIT');
            return apiResponse_1.ApiResponse.success(res, wallet_mapper_1.WalletMapper.toResponseDto(wallet), wallet_messages_1.WALLET_MESSAGES.CREDIT_SUCCESS);
        };
        this.createTopupOrder = async (req, res) => {
            const userId = req.auth.userId;
            const { amount } = req.body;
            if (!amount || amount <= 0) {
                throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INVALID_AMOUNT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const order = await this.walletService.createTopupOrder(userId, amount);
            return apiResponse_1.ApiResponse.success(res, order, wallet_messages_1.WALLET_MESSAGES.TOPUP_ORDER_SUCCESS, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.verifyTopup = async (req, res) => {
            const userId = req.auth.userId;
            const { orderId, paymentId, signature } = req.body;
            const wallet = await this.walletService.verifyTopupAndCredit(userId, orderId, paymentId, signature);
            return apiResponse_1.ApiResponse.success(res, wallet_mapper_1.WalletMapper.toResponseDto(wallet), wallet_messages_1.WALLET_MESSAGES.CREDIT_SUCCESS);
        };
    }
};
exports.WalletController = WalletController;
exports.WalletController = WalletController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.WalletService)),
    __metadata("design:paramtypes", [Object])
], WalletController);
