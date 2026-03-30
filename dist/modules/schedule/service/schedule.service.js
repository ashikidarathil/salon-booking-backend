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
exports.ScheduleService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const schedule_mapper_1 = require("../mapper/schedule.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const schedule_constants_1 = require("../constants/schedule.constants");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let ScheduleService = class ScheduleService {
    constructor(weeklyRepo, dailyRepo, breakRepo, stylistRepo) {
        this.weeklyRepo = weeklyRepo;
        this.dailyRepo = dailyRepo;
        this.breakRepo = breakRepo;
        this.stylistRepo = stylistRepo;
    }
    timeToMinutes(time) {
        const [hrs, mins] = time.split(':').map(Number);
        return hrs * 60 + mins;
    }
    // Helper to resolve user ID to stylist ID
    async resolveStylistId(userIdOrStylistId) {
        if (!(0, mongoose_util_1.isValidObjectId)(userIdOrStylistId)) {
            return userIdOrStylistId;
        }
        const stylistId = await this.stylistRepo.findIdByUserId(userIdOrStylistId);
        return stylistId || userIdOrStylistId;
    }
    async updateWeeklySchedule(dto) {
        const stylistId = await this.resolveStylistId(dto.stylistId);
        let schedule = await this.weeklyRepo.findOne({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            dayOfWeek: dto.dayOfWeek,
        });
        if (schedule) {
            schedule.isWorkingDay = dto.isWorkingDay;
            schedule.shifts = dto.shifts;
            schedule = await this.weeklyRepo.save(schedule);
        }
        else {
            schedule = await this.weeklyRepo.create({
                stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
                branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
                dayOfWeek: dto.dayOfWeek,
                isWorkingDay: dto.isWorkingDay,
                shifts: dto.shifts,
            });
        }
        return schedule_mapper_1.ScheduleMapper.toWeeklyResponse(schedule);
    }
    async getWeeklySchedule(userIdOrStylistId, branchId) {
        const stylistId = await this.resolveStylistId(userIdOrStylistId);
        const schedules = await this.weeklyRepo.find({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
        });
        return schedules.map(schedule_mapper_1.ScheduleMapper.toWeeklyResponse);
    }
    async createDailyOverride(dto) {
        const stylistId = await this.resolveStylistId(dto.stylistId);
        const date = new Date(dto.date);
        date.setUTCHours(0, 0, 0, 0);
        // Remove existing override for the same date if any
        const existing = await this.dailyRepo.findOne({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            date,
        });
        if (existing) {
            await this.dailyRepo.delete(existing._id.toString());
        }
        const override = await this.dailyRepo.create({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            date,
            isWorkingDay: dto.isWorkingDay,
            shifts: dto.shifts,
            reason: dto.reason,
        });
        return schedule_mapper_1.ScheduleMapper.toDailyResponse(override);
    }
    async deleteDailyOverride(id) {
        const success = await this.dailyRepo.delete(id);
        if (!success) {
            throw new appError_1.AppError(schedule_constants_1.SCHEDULE_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
    }
    async getDailyOverrides(userIdOrStylistId, branchId, startDate, endDate) {
        const stylistId = await this.resolveStylistId(userIdOrStylistId);
        const filter = {
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
        };
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate)
                dateFilter.$gte = startDate;
            if (endDate)
                dateFilter.$lte = endDate;
            filter.date = dateFilter;
        }
        const overrides = await this.dailyRepo.find(filter);
        return overrides.map(schedule_mapper_1.ScheduleMapper.toDailyResponse);
    }
    async addBreak(dto, userRole) {
        const stylistId = await this.resolveStylistId(dto.stylistId);
        // Enforce 2-break limit for non-admins
        if (userRole !== 'ADMIN') {
            const filter = {
                stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
                branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            };
            if (dto.date) {
                filter.date = new Date(dto.date);
                filter.date.setUTCHours(0, 0, 0, 0);
            }
            else {
                filter.dayOfWeek = dto.dayOfWeek;
            }
            const existingBreaks = await this.breakRepo.find(filter);
            // Calculate total duration including the new break
            const newBreakDuration = this.timeToMinutes(dto.endTime) - this.timeToMinutes(dto.startTime);
            const existingDuration = existingBreaks.reduce((sum, b) => sum + (this.timeToMinutes(b.endTime) - this.timeToMinutes(b.startTime)), 0);
            if (existingDuration + newBreakDuration > 90) {
                throw new appError_1.AppError(schedule_constants_1.SCHEDULE_MESSAGES.BREAK_LIMIT_EXCEEDED(existingDuration + newBreakDuration), httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
        }
        const date = dto.date ? new Date(dto.date) : undefined;
        if (date)
            date.setUTCHours(0, 0, 0, 0);
        const stylistBreak = await this.breakRepo.create({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            dayOfWeek: dto.dayOfWeek,
            date,
            startTime: dto.startTime,
            endTime: dto.endTime,
            description: dto.description,
        });
        return schedule_mapper_1.ScheduleMapper.toBreakResponse(stylistBreak);
    }
    async deleteBreak(id) {
        const success = await this.breakRepo.delete(id);
        if (!success) {
            throw new appError_1.AppError(schedule_constants_1.SCHEDULE_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
    }
    async getBreaks(userIdOrStylistId, branchId) {
        const stylistId = await this.resolveStylistId(userIdOrStylistId);
        const breaks = await this.breakRepo.find({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
        });
        return breaks.map(schedule_mapper_1.ScheduleMapper.toBreakResponse);
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.WeeklyScheduleRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.DailyOverrideRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistBreakRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ScheduleService);
