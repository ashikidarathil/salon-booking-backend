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
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const socket_service_1 = require("../../../socket/socket.service");
const notification_mapper_1 = require("../mapper/notification.mapper");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let NotificationService = class NotificationService {
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async createNotification(data) {
        const notification = await this.notificationRepo.create({
            recipientId: (0, mongoose_util_1.toObjectId)(data.recipientId),
            senderId: data.senderId ? (0, mongoose_util_1.toObjectId)(data.senderId) : undefined,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
        });
        socket_service_1.SocketService.sendToUser(data.recipientId, 'new_notification', notification_mapper_1.NotificationMapper.toResponseDto(notification));
        return notification;
    }
    async getUserNotifications(userId, isRead, limit = 20, skip = 0) {
        return this.notificationRepo.findByRecipient(userId, isRead, limit, skip);
    }
    async getUnreadCount(userId) {
        return this.notificationRepo.countUnread(userId);
    }
    async markAsRead(notificationId) {
        await this.notificationRepo.markAsRead(notificationId);
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.markAllAsRead(userId);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationRepository)),
    __metadata("design:paramtypes", [Object])
], NotificationService);
