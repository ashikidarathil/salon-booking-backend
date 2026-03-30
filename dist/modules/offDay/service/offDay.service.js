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
exports.OffDayService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const offDay_mapper_1 = require("../mapper/offDay.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const offDay_constants_1 = require("../constants/offDay.constants");
const stylistOffDay_model_1 = require("../../../models/stylistOffDay.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const notification_model_1 = require("../../../models/notification.model");
let OffDayService = class OffDayService {
    constructor(offDayRepo, stylistRepo, userRepo, notificationService) {
        this.offDayRepo = offDayRepo;
        this.stylistRepo = stylistRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }
    // Helper to resolve user ID to stylist ID
    async resolveStylistId(userIdOrStylistId) {
        if (!(0, mongoose_util_1.isValidObjectId)(userIdOrStylistId)) {
            return userIdOrStylistId;
        }
        const stylistId = await this.stylistRepo.findIdByUserId(userIdOrStylistId);
        return stylistId || userIdOrStylistId;
    }
    async requestOffDay(dto) {
        const stylistId = await this.resolveStylistId(dto.stylistId);
        // Validation: 3-day advance notice
        const startDate = new Date(dto.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3);
        if (startDate < minDate) {
            throw new appError_1.AppError(offDay_constants_1.OFF_DAY_MESSAGES.INVALID_DATE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const offDay = await this.offDayRepo.create({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            type: dto.type,
            startDate,
            endDate: new Date(dto.endDate),
            reason: dto.reason,
            status: stylistOffDay_model_1.OffDayStatus.PENDING,
        });
        // Notify all admins
        try {
            const admins = await this.userRepo.findAllByRole(userRole_enum_1.UserRole.ADMIN);
            const notifications = admins.map((admin) => ({
                recipientId: admin.id.toString(),
                senderId: dto.stylistId,
                type: notification_model_1.NotificationType.SYSTEM,
                title: 'New Leave Request',
                message: `A stylist has requested an off-day (${dto.type}) starting on ${startDate.toLocaleDateString()}.`,
                link: '/admin/off-days',
            }));
            await Promise.all(notifications.map((n) => this.notificationService.createNotification(n)));
        }
        catch (error) {
            console.error('Failed to send admin notifications for leave request:', error);
        }
        return offDay_mapper_1.OffDayMapper.toResponse(offDay);
    }
    async getOffDays(userIdOrStylistId, startDate, endDate) {
        const stylistId = await this.resolveStylistId(userIdOrStylistId);
        const filter = {
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
        };
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate)
                dateFilter.$gte = startDate;
            if (endDate)
                dateFilter.$lte = endDate;
            filter.startDate = dateFilter;
        }
        const offDays = await this.offDayRepo.find(filter);
        return offDays.map(offDay_mapper_1.OffDayMapper.toResponse);
    }
    async getAllOffDays(startDate, endDate) {
        const filter = {};
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate)
                dateFilter.$gte = startDate;
            if (endDate)
                dateFilter.$lte = endDate;
            filter.startDate = dateFilter;
        }
        const offDays = await this.offDayRepo.find(filter);
        return offDays.map(offDay_mapper_1.OffDayMapper.toResponse);
    }
    async updateOffDayStatus(id, adminId, dto) {
        const offDay = await this.offDayRepo.findById(id);
        if (!offDay) {
            throw new appError_1.AppError(offDay_constants_1.OFF_DAY_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const updateData = {
            status: dto.status,
            adminRemarks: dto.adminRemarks,
        };
        if (dto.status === stylistOffDay_model_1.OffDayStatus.APPROVED) {
            updateData.approvedBy = (0, mongoose_util_1.toObjectId)(adminId);
            updateData.approvedAt = new Date();
        }
        const updated = await this.offDayRepo.update(id, updateData);
        if (!updated) {
            throw new appError_1.AppError(offDay_constants_1.OFF_DAY_MESSAGES.FAILED_STATUS, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            const stylist = await this.stylistRepo.getById(offDay.stylistId.toString());
            if (stylist && stylist.userId) {
                await this.notificationService.createNotification({
                    recipientId: stylist.userId.toString(),
                    senderId: adminId,
                    type: notification_model_1.NotificationType.SYSTEM,
                    title: `Leave Request ${dto.status}`,
                    message: `Your leave request has been ${dto.status.toLowerCase()}. ${dto.adminRemarks ? `Admin remarks: "${dto.adminRemarks}"` : ''}`,
                    link: '/stylist/off-days',
                });
            }
        }
        catch (error) {
            console.error('Failed to notify stylist of leave status update:', error);
        }
        return offDay_mapper_1.OffDayMapper.toResponse(updated);
    }
    async deleteOffDay(id) {
        const success = await this.offDayRepo.delete(id);
        if (!success) {
            throw new appError_1.AppError(offDay_constants_1.OFF_DAY_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
    }
};
exports.OffDayService = OffDayService;
exports.OffDayService = OffDayService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.OffDayRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], OffDayService);
