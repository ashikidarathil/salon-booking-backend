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
exports.WalletTransactionRepository = void 0;
const baseRepository_1 = require("../../../common/repository/baseRepository");
const walletTransaction_model_1 = require("../../../models/walletTransaction.model");
const tsyringe_1 = require("tsyringe");
let WalletTransactionRepository = class WalletTransactionRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(walletTransaction_model_1.WalletTransactionModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByWalletId(walletId) {
        return this.find({ walletId }, undefined, { createdAt: -1 });
    }
};
exports.WalletTransactionRepository = WalletTransactionRepository;
exports.WalletTransactionRepository = WalletTransactionRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WalletTransactionRepository);
