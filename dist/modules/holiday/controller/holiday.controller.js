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
exports.HolidayController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const holiday_constants_1 = require("../constants/holiday.constants");
let HolidayController = class HolidayController {
    constructor(holidayService) {
        this.holidayService = holidayService;
        this.deleteHoliday = async (req, res) => {
            const { id } = req.params;
            await this.holidayService.deleteHoliday(id);
            return apiResponse_1.ApiResponse.success(res, undefined, holiday_constants_1.HOLIDAY_MESSAGES.DELETED);
        };
    }
    async createHoliday(req, res) {
        const dto = req.body;
        const holiday = await this.holidayService.createHoliday(dto);
        return apiResponse_1.ApiResponse.success(res, holiday, holiday_constants_1.HOLIDAY_MESSAGES.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
    }
    async getHolidays(req, res) {
        const branchId = req.query.branchId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        const holidays = await this.holidayService.getHolidays(branchId, start, end);
        return apiResponse_1.ApiResponse.success(res, holidays, holiday_constants_1.HOLIDAY_MESSAGES.FETCHED);
    }
};
exports.HolidayController = HolidayController;
exports.HolidayController = HolidayController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.HolidayService)),
    __metadata("design:paramtypes", [Object])
], HolidayController);
