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
exports.WithdrawalRequestRepository = void 0;
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const withdrawalRequest_model_1 = require("../../../models/withdrawalRequest.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let WithdrawalRequestRepository = class WithdrawalRequestRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(withdrawalRequest_model_1.WithdrawalRequestModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByStylistId(stylistId) {
        return this.find({ stylistId }, [], { createdAt: -1 });
    }
    async findAll(filter, sort, populate) {
        return this.find(filter, populate, sort);
    }
    async updateStatus(id, status, processedAt, rejectionReason, paymentReferenceNumber, paidByAdminId, session) {
        const updateData = { status };
        if (processedAt)
            updateData.processedAt = processedAt;
        if (rejectionReason)
            updateData.rejectionReason = rejectionReason;
        if (paymentReferenceNumber)
            updateData.paymentReferenceNumber = paymentReferenceNumber;
        if (paidByAdminId) {
            updateData.paidByAdminId = (0, mongoose_util_1.toObjectId)(paidByAdminId);
            updateData.paidAt = new Date();
            if (status === withdrawalRequest_model_1.WithdrawalStatus.APPROVED)
                updateData.approvedAt = new Date();
        }
        return this.update(id, updateData, session);
    }
};
exports.WithdrawalRequestRepository = WithdrawalRequestRepository;
exports.WithdrawalRequestRepository = WithdrawalRequestRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WithdrawalRequestRepository);
