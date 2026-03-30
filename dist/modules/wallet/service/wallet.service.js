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
exports.WalletService = void 0;
const tsyringe_1 = require("tsyringe");
const walletTransaction_model_1 = require("../../../models/walletTransaction.model");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const wallet_messages_1 = require("../constants/wallet.messages");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const tokens_1 = require("../../../common/di/tokens");
const payment_model_1 = require("../../../models/payment.model");
const env_1 = require("../../../config/env");
let WalletService = class WalletService {
    constructor(walletRepository, transactionRepository, razorpayService, paymentRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.razorpayService = razorpayService;
        this.paymentRepository = paymentRepository;
    }
    async getWalletByUserId(userId) {
        const wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            return this.ensureWalletExists(userId);
        }
        return wallet;
    }
    async ensureWalletExists(userId, session) {
        let wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            wallet = await this.walletRepository.create({ userId: (0, mongoose_util_1.toObjectId)(userId), balance: 0 }, session);
        }
        return wallet;
    }
    async creditBalance(userId, amount, description, referenceId, referenceType, session) {
        if (amount <= 0) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INVALID_AMOUNT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const wallet = await this.ensureWalletExists(userId, session);
        const updatedWallet = await this.walletRepository.updateBalance(userId, amount, session);
        if (!updatedWallet) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Record transaction
        await this.transactionRepository.create({
            walletId: wallet._id,
            amount,
            type: walletTransaction_model_1.TransactionType.CREDIT,
            status: walletTransaction_model_1.TransactionStatus.COMPLETED,
            description,
            referenceId: referenceId ? (0, mongoose_util_1.toObjectId)(referenceId) : undefined,
            referenceType,
        }, session);
        return updatedWallet;
    }
    async debitBalance(userId, amount, description, referenceId, referenceType, session) {
        if (amount <= 0) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INVALID_AMOUNT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const wallet = await this.getWalletByUserId(userId);
        if (wallet.balance < amount) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INSUFFICIENT_BALANCE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const updatedWallet = await this.walletRepository.updateBalance(userId, -amount, session);
        if (!updatedWallet) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Record transaction
        await this.transactionRepository.create({
            walletId: wallet._id,
            amount,
            type: walletTransaction_model_1.TransactionType.DEBIT,
            status: walletTransaction_model_1.TransactionStatus.COMPLETED,
            description,
            referenceId: referenceId ? (0, mongoose_util_1.toObjectId)(referenceId) : undefined,
            referenceType,
        }, session);
        return updatedWallet;
    }
    async getTransactionHistory(userId) {
        const wallet = await this.getWalletByUserId(userId);
        return this.transactionRepository.findByWalletId(wallet._id.toString());
    }
    async createTopupOrder(userId, amount) {
        if (amount < 100) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.MIN_TOPUP_ERROR, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        // Ensure wallet exists
        await this.ensureWalletExists(userId);
        const shortUserId = userId.slice(-8);
        const shortTs = Date.now().toString().slice(-8);
        const order = (await this.razorpayService.createOrder(amount, 'INR', `tp_${shortUserId}_${shortTs}`));
        await this.paymentRepository.create({
            orderId: order.id,
            amount,
            currency: 'INR',
            status: payment_model_1.PaymentStatus.PENDING,
            userId: (0, mongoose_util_1.toObjectId)(userId),
        });
        return { orderId: order.id, amount, currency: 'INR', keyId: env_1.env.RAZORPAY_KEY_ID };
    }
    async verifyTopupAndCredit(userId, orderId, paymentId, signature) {
        const isVerified = this.razorpayService.verifySignature(orderId, paymentId, signature);
        if (!isVerified) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.INVALID_SIGNATURE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const payment = await this.paymentRepository.findByOrderId(orderId);
        if (!payment) {
            throw new appError_1.AppError(wallet_messages_1.WALLET_MESSAGES.PAYMENT_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        // Mark payment as completed
        await this.paymentRepository.update(payment._id.toString(), {
            status: payment_model_1.PaymentStatus.COMPLETED,
            paymentId,
            signature,
        });
        // Credit the wallet
        return this.creditBalance(userId, payment.amount, 'Wallet top-up via Razorpay', payment._id.toString(), 'DEPOSIT');
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.WalletRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.WalletTransactionRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.RazorpayService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.PaymentRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WalletService);
