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
exports.StylistWalletRepository = void 0;
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const stylistWallet_model_1 = require("../../../models/stylistWallet.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let StylistWalletRepository = class StylistWalletRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(stylistWallet_model_1.StylistWalletModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByStylistId(stylistId) {
        return this.findOne({ stylistId });
    }
    async updateBalance(stylistId, update, session) {
        const mongoUpdate = {};
        if (update.withdrawableBalance !== undefined) {
            mongoUpdate.$inc = { ...mongoUpdate.$inc, withdrawableBalance: update.withdrawableBalance };
        }
        if (update.pendingWithdrawal !== undefined) {
            mongoUpdate.$inc = { ...mongoUpdate.$inc, pendingWithdrawal: update.pendingWithdrawal };
        }
        if (update.totalEarnings !== undefined) {
            mongoUpdate.$inc = { ...mongoUpdate.$inc, totalEarnings: update.totalEarnings };
        }
        return this._model
            .findOneAndUpdate({ stylistId: (0, mongoose_util_1.toObjectId)(stylistId) }, mongoUpdate, { new: true, session })
            .exec();
    }
};
exports.StylistWalletRepository = StylistWalletRepository;
exports.StylistWalletRepository = StylistWalletRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StylistWalletRepository);
