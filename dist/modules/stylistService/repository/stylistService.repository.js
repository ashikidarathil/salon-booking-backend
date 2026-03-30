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
exports.StylistServiceRepository = void 0;
const stylistService_model_1 = require("../../../models/stylistService.model");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const tsyringe_1 = require("tsyringe");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let StylistServiceRepository = class StylistServiceRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(stylistService_model_1.StylistServiceModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByStylistId(stylistId) {
        return stylistService_model_1.StylistServiceModel.find({ stylistId: (0, mongoose_util_1.toObjectId)(stylistId) }).sort({ createdAt: -1 });
    }
    async findByServiceId(serviceId) {
        return stylistService_model_1.StylistServiceModel.find({ serviceId: (0, mongoose_util_1.toObjectId)(serviceId), isActive: true })
            .populate({
            path: 'stylistId',
            populate: { path: 'userId', select: 'name' },
        })
            .lean();
    }
    async toggleStatus(stylistId, serviceId, isActive, updatedBy) {
        return stylistService_model_1.StylistServiceModel.findOneAndUpdate({ stylistId: (0, mongoose_util_1.toObjectId)(stylistId), serviceId: (0, mongoose_util_1.toObjectId)(serviceId) }, { isActive, updatedBy: (0, mongoose_util_1.toObjectId)(updatedBy) }, { new: true, upsert: true });
    }
};
exports.StylistServiceRepository = StylistServiceRepository;
exports.StylistServiceRepository = StylistServiceRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StylistServiceRepository);
