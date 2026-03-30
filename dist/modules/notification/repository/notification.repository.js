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
exports.NotificationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const notification_model_1 = require("../../../models/notification.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let NotificationRepository = class NotificationRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(notification_model_1.NotificationModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByRecipient(userId, isRead, limit = 20, skip = 0) {
        const filter = { recipientId: (0, mongoose_util_1.toObjectId)(userId) };
        if (isRead !== undefined) {
            filter.isRead = isRead;
        }
        const docs = await this._model
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return docs.map((d) => this.toEntity(d));
    }
    async countUnread(userId) {
        return this._model.countDocuments({
            recipientId: (0, mongoose_util_1.toObjectId)(userId),
            isRead: false,
        });
    }
    async markAsRead(id) {
        return this.update(id, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this._model.updateMany({ recipientId: (0, mongoose_util_1.toObjectId)(userId), isRead: false }, { $set: { isRead: true } });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], NotificationRepository);
