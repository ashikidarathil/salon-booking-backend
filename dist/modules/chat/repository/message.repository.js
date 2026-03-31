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
exports.MessageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const message_model_1 = require("../../../models/message.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let MessageRepository = class MessageRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(message_model_1.MessageModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByRoomId(roomId, limit = 50, skip = 0) {
        const docs = await this._model
            .find({ chatRoomId: (0, mongoose_util_1.toObjectId)(roomId) })
            .sort({ createdAt: -1 }) // Get newest first
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'bookingId',
            select: 'bookingNumber status items',
            populate: {
                path: 'items.serviceId',
                select: 'name',
            },
        })
            .exec();
        return docs.map((doc) => this.toEntity(doc)).reverse(); // Reverse to return chronological order
    }
    async markAsRead(roomId, receiverId) {
        await this._model.updateMany({
            chatRoomId: (0, mongoose_util_1.toObjectId)(roomId),
            senderId: { $ne: (0, mongoose_util_1.toObjectId)(receiverId) },
            isRead: false,
        }, {
            $set: { isRead: true },
        });
    }
    async countUnreadMessages(roomId, receiverId) {
        return this.count({
            chatRoomId: (0, mongoose_util_1.toObjectId)(roomId),
            senderId: { $ne: (0, mongoose_util_1.toObjectId)(receiverId) },
            isRead: false,
        });
    }
    async countTotalUnread(roomIds, receiverId) {
        if (!roomIds.length)
            return 0;
        return this.count({
            chatRoomId: { $in: roomIds.map(mongoose_util_1.toObjectId) },
            senderId: { $ne: (0, mongoose_util_1.toObjectId)(receiverId) },
            isRead: false,
        });
    }
    async countUnreadPerRoom(roomIds, receiverId) {
        if (!roomIds.length)
            return {};
        const results = await this._model.aggregate([
            {
                $match: {
                    chatRoomId: { $in: roomIds.map(mongoose_util_1.toObjectId) },
                    senderId: { $ne: (0, mongoose_util_1.toObjectId)(receiverId) },
                    isRead: false,
                },
            },
            {
                $group: {
                    _id: { $toString: '$chatRoomId' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const map = {};
        for (const r of results) {
            map[r._id] = r.count;
        }
        return map;
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MessageRepository);
