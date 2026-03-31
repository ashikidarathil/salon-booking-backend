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
exports.ChatRoomRepository = void 0;
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
const chatRoom_model_1 = require("../../../models/chatRoom.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let ChatRoomRepository = class ChatRoomRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(chatRoom_model_1.ChatRoomModel);
    }
    toEntity(doc) {
        return doc;
    }
    async findByBookingId(bookingId) {
        return this.findOne({ bookingId: (0, mongoose_util_1.toObjectId)(bookingId) });
    }
    async findByUserAndStylist(userId, stylistId) {
        return this.findOne({
            userId: (0, mongoose_util_1.toObjectId)(userId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
        });
    }
    async findUserRooms(userId, search) {
        const rooms = await this.find({ userId: (0, mongoose_util_1.toObjectId)(userId) }, [
            {
                path: 'stylistId',
                select: 'userId profilePicture',
                populate: { path: 'userId', select: 'name profilePicture' },
            },
            { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
        ], { lastMessageAt: -1 });
        if (!search)
            return rooms;
        const lowerSearch = search.toLowerCase();
        return rooms.filter((room) => {
            const stylist = room.stylistId;
            const booking = room.bookingId;
            const stylistName = stylist?.userId?.name?.toLowerCase() ?? '';
            const bookingRef = booking?.bookingNumber?.toLowerCase() ?? '';
            return stylistName.includes(lowerSearch) || bookingRef.includes(lowerSearch);
        });
    }
    async findStylistRooms(stylistId, search) {
        const rooms = await this.find({ stylistId: (0, mongoose_util_1.toObjectId)(stylistId) }, [
            { path: 'userId', select: 'name profilePicture' },
            { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
        ], { lastMessageAt: -1 });
        if (!search)
            return rooms;
        const lowerSearch = search.toLowerCase();
        return rooms.filter((room) => {
            const user = room.userId;
            const booking = room.bookingId;
            const userName = user?.name?.toLowerCase() ?? '';
            const bookingRef = booking?.bookingNumber?.toLowerCase() ?? '';
            return userName.includes(lowerSearch) || bookingRef.includes(lowerSearch);
        });
    }
    async findAll(limit = 50, skip = 0) {
        const docs = await this._model
            .find()
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
            { path: 'userId', select: 'name profilePicture' },
            {
                path: 'stylistId',
                select: 'userId profilePicture',
                populate: { path: 'userId', select: 'name profilePicture' },
            },
            { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
        ])
            .exec();
        return docs.map((d) => this.toEntity(d));
    }
    async updateLastMessage(roomId, message, messageType) {
        await this.update(roomId, {
            lastMessage: message,
            lastMessageType: messageType,
            lastMessageAt: new Date(),
        });
    }
    async closeRoom(roomId) {
        await this._model.updateOne({ _id: (0, mongoose_util_1.toObjectId)(roomId) }, { $set: { status: chatRoom_model_1.ChatRoomStatus.CLOSED } });
    }
    async closeExpiredRooms() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const expiredRooms = await this._model
            .find({ status: chatRoom_model_1.ChatRoomStatus.OPEN })
            .populate({
            path: 'bookingId',
            select: 'status completedAt cancelledAt',
            match: {
                $or: [
                    { status: 'COMPLETED', completedAt: { $lt: cutoff } },
                    { status: 'CANCELLED', cancelledAt: { $lt: cutoff } },
                ],
            },
        })
            .select('_id')
            .exec();
        // Only rooms where the populate matched (booking not null)
        const roomIdsToClose = expiredRooms.filter((r) => r.bookingId != null).map((r) => r._id);
        if (roomIdsToClose.length === 0)
            return 0;
        await this._model.updateMany({ _id: { $in: roomIdsToClose } }, { $set: { status: chatRoom_model_1.ChatRoomStatus.CLOSED } });
        return roomIdsToClose.length;
    }
};
exports.ChatRoomRepository = ChatRoomRepository;
exports.ChatRoomRepository = ChatRoomRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ChatRoomRepository);
