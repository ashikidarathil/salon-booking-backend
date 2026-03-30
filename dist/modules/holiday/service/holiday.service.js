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
exports.HolidayService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const holiday_mapper_1 = require("../mapper/holiday.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const holiday_constants_1 = require("../constants/holiday.constants");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let HolidayService = class HolidayService {
    constructor(holidayRepo) {
        this.holidayRepo = holidayRepo;
    }
    async createHoliday(dto) {
        const holiday = await this.holidayRepo.create({
            branchIds: dto.isAllBranches ? [] : (dto.branchIds || []).map((id) => (0, mongoose_util_1.toObjectId)(id)),
            date: new Date(dto.date),
            name: dto.name,
            isAllBranches: dto.isAllBranches,
        });
        return holiday_mapper_1.HolidayMapper.toResponse(holiday);
    }
    async getHolidays(branchId, startDate, endDate) {
        const filter = {};
        if (branchId) {
            filter.$or = [{ branchIds: (0, mongoose_util_1.toObjectId)(branchId) }, { isAllBranches: true }];
        }
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate)
                dateFilter.$gte = startDate;
            if (endDate)
                dateFilter.$lte = endDate;
            filter.date = dateFilter;
        }
        const holidays = await this.holidayRepo.find(filter);
        return holidays.map(holiday_mapper_1.HolidayMapper.toResponse);
    }
    async deleteHoliday(id) {
        const success = await this.holidayRepo.delete(id);
        if (!success) {
            throw new appError_1.AppError(holiday_constants_1.HOLIDAY_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
    }
};
exports.HolidayService = HolidayService;
exports.HolidayService = HolidayService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.HolidayRepository)),
    __metadata("design:paramtypes", [Object])
], HolidayService);
