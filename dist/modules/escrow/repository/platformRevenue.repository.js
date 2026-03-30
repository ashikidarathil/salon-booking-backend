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
exports.PlatformRevenueRepository = void 0;
const tsyringe_1 = require("tsyringe");
const platformRevenue_model_1 = require("../../../models/platformRevenue.model");
const baseRepository_1 = require("../../../common/repository/baseRepository");
let PlatformRevenueRepository = class PlatformRevenueRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(platformRevenue_model_1.PlatformRevenueModel);
    }
    toEntity(doc) {
        return doc;
    }
    async getTotalRevenue() {
        const result = await platformRevenue_model_1.PlatformRevenueModel.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result[0]?.total ?? 0;
    }
    async findAll() {
        return platformRevenue_model_1.PlatformRevenueModel.find().sort({ createdAt: -1 }).lean();
    }
};
exports.PlatformRevenueRepository = PlatformRevenueRepository;
exports.PlatformRevenueRepository = PlatformRevenueRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PlatformRevenueRepository);
