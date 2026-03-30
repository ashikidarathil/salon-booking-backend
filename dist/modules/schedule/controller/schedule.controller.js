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
exports.ScheduleController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const schedule_constants_1 = require("../constants/schedule.constants");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
        this.updateWeekly = async (req, res) => {
            const { dayOfWeek } = req.params;
            const dto = {
                ...req.body,
                dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : req.body.dayOfWeek,
            };
            const schedule = await this.scheduleService.updateWeeklySchedule(dto);
            return apiResponse_1.ApiResponse.success(res, schedule, schedule_constants_1.SCHEDULE_MESSAGES.WEEKLY_UPDATED);
        };
        this.getWeekly = async (req, res) => {
            const { stylistId } = req.params;
            const { branchId } = req.query;
            const schedules = await this.scheduleService.getWeeklySchedule(stylistId, branchId);
            return apiResponse_1.ApiResponse.success(res, schedules, schedule_constants_1.SCHEDULE_MESSAGES.WEEKLY_FETCHED);
        };
        this.createDailyOverride = async (req, res) => {
            const dto = req.body;
            const override = await this.scheduleService.createDailyOverride(dto);
            return apiResponse_1.ApiResponse.success(res, override, schedule_constants_1.SCHEDULE_MESSAGES.OVERRIDE_CREATED);
        };
        this.deleteDailyOverride = async (req, res) => {
            const { id } = req.params;
            await this.scheduleService.deleteDailyOverride(id);
            return apiResponse_1.ApiResponse.success(res, undefined, schedule_constants_1.SCHEDULE_MESSAGES.OVERRIDE_DELETED);
        };
        this.getDailyOverrides = async (req, res) => {
            const { stylistId } = req.params;
            const { branchId, startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const overrides = await this.scheduleService.getDailyOverrides(stylistId, branchId, start, end);
            return apiResponse_1.ApiResponse.success(res, overrides, schedule_constants_1.SCHEDULE_MESSAGES.OVERRIDE_FETCHED);
        };
        this.addBreak = async (req, res) => {
            const dto = req.body;
            const authReq = req;
            const role = authReq.auth?.role;
            const stylistBreak = await this.scheduleService.addBreak(dto, role);
            return apiResponse_1.ApiResponse.success(res, stylistBreak, schedule_constants_1.SCHEDULE_MESSAGES.BREAK_ADDED, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.deleteBreak = async (req, res) => {
            const { id } = req.params;
            await this.scheduleService.deleteBreak(id);
            return apiResponse_1.ApiResponse.success(res, undefined, schedule_constants_1.SCHEDULE_MESSAGES.BREAK_DELETED);
        };
        this.getBreaks = async (req, res) => {
            const { stylistId } = req.params;
            const { branchId } = req.query;
            const breaks = await this.scheduleService.getBreaks(stylistId, branchId);
            return apiResponse_1.ApiResponse.success(res, breaks, schedule_constants_1.SCHEDULE_MESSAGES.BREAK_FETCHED);
        };
    }
};
exports.ScheduleController = ScheduleController;
exports.ScheduleController = ScheduleController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ScheduleService)),
    __metadata("design:paramtypes", [Object])
], ScheduleController);
