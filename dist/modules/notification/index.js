"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNotificationController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const notification_repository_1 = require("./repository/notification.repository");
const notification_service_1 = require("./service/notification.service");
const notification_controller_1 = require("./controller/notification.controller");
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.NotificationRepository, notification_repository_1.NotificationRepository);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.NotificationService, notification_service_1.NotificationService);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.NotificationController, notification_controller_1.NotificationController);
const resolveNotificationController = () => {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.NotificationController);
};
exports.resolveNotificationController = resolveNotificationController;
