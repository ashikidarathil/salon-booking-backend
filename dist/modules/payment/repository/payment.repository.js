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
exports.PaymentRepository = void 0;
const baseRepository_1 = require("../../../common/repository/baseRepository");
const payment_model_1 = require("../../../models/payment.model");
const tsyringe_1 = require("tsyringe");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let PaymentRepository = class PaymentRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(payment_model_1.PaymentModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByOrderId(orderId) {
        return this.findOne({ orderId, isDeleted: false });
    }
    async softDelete(id, session) {
        const result = await this.update((0, mongoose_util_1.toObjectId)(id).toString(), { isDeleted: true }, session);
        return !!result;
    }
    async findById(id) {
        return this.findOne({ _id: id, isDeleted: false });
    }
    async find(filter) {
        return super.find({ ...filter, isDeleted: false });
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PaymentRepository);
