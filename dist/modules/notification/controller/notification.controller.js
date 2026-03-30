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
exports.NotificationController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const notification_messages_1 = require("../constants/notification.messages");
const notification_mapper_1 = require("../mapper/notification.mapper");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const appError_1 = require("../../../common/errors/appError");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.getMyNotifications = async (req, res) => {
            const userId = req.auth.userId;
            const { limit, skip, isRead } = req.query;
            let isReadBool = undefined;
            if (isRead === 'true')
                isReadBool = true;
            else if (isRead === 'false')
                isReadBool = false;
            const notifications = await this.notificationService.getUserNotifications(userId, isReadBool, limit ? parseInt(limit) : 20, skip ? parseInt(skip) : 0);
            const unreadCount = await this.notificationService.getUnreadCount(userId);
            return apiResponse_1.ApiResponse.success(res, {
                notifications: notification_mapper_1.NotificationMapper.toResponseDtoList(notifications),
                unreadCount,
            }, notification_messages_1.NOTIFICATION_MESSAGES.FETCHED);
        };
        this.markAsRead = async (req, res) => {
            const { id } = req.params;
            if (!id || !(0, mongoose_util_1.isValidObjectId)(id)) {
                throw new appError_1.AppError(notification_messages_1.NOTIFICATION_MESSAGES.ID_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            await this.notificationService.markAsRead(id);
            return apiResponse_1.ApiResponse.success(res, undefined, notification_messages_1.NOTIFICATION_MESSAGES.READ_SUCCESS);
        };
        this.markAllAsRead = async (req, res) => {
            const userId = req.auth.userId;
            await this.notificationService.markAllAsRead(userId);
            return apiResponse_1.ApiResponse.success(res, undefined, notification_messages_1.NOTIFICATION_MESSAGES.ALL_READ_SUCCESS);
        };
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object])
], NotificationController);
