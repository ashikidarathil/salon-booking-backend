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
exports.HolidayRepository = void 0;
const holiday_model_1 = require("../../../models/holiday.model");
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let HolidayRepository = class HolidayRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(holiday_model_1.HolidayModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findHolidaysInRange(branchId, startDate, endDate) {
        return await holiday_model_1.HolidayModel.find({
            $or: [{ branchId: null, isAllBranches: true }, { branchId: (0, mongoose_util_1.toObjectId)(branchId) }],
            date: { $gte: startDate, $lte: endDate },
        });
    }
};
exports.HolidayRepository = HolidayRepository;
exports.HolidayRepository = HolidayRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], HolidayRepository);
