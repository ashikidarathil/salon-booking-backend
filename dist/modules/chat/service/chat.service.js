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
exports.ChatService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const chatRoom_model_1 = require("../../../models/chatRoom.model");
const notification_model_1 = require("../../../models/notification.model");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const chat_messages_1 = require("../constants/chat.messages");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const chat_types_1 = require("../constants/chat.types");
const chat_mapper_1 = require("../mapper/chat.mapper");
const booking_model_1 = require("../../../models/booking.model");
let ChatService = class ChatService {
    constructor(chatRoomRepo, messageRepo, notificationService, bookingRepo, stylistRepo, userRepo) {
        this.chatRoomRepo = chatRoomRepo;
        this.messageRepo = messageRepo;
        this.notificationService = notificationService;
        this.bookingRepo = bookingRepo;
        this.stylistRepo = stylistRepo;
        this.userRepo = userRepo;
        this.EXPIRY_WINDOW = 24 * 60 * 60 * 1000;
    }
    async initializeRoom(bookingId, requestUserId) {
        if (!(0, mongoose_util_1.isValidObjectId)(bookingId)) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.BOOKING_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const bUserId = (0, mongoose_util_1.getIdString)(booking.userId);
        const bStylistId = (0, mongoose_util_1.getIdString)(booking.stylistId);
        await this.authorizeRoomAccess(requestUserId, bUserId, bStylistId);
        return this.findOrCreateRoom(bookingId, bUserId, bStylistId);
    }
    async createRoom(bookingId, userId, stylistId) {
        return this.findOrCreateRoom(bookingId, userId, stylistId);
    }
    async findOrCreateRoom(bookingId, userId, stylistId) {
        const existing = await this.chatRoomRepo.findByUserAndStylist(userId, stylistId);
        if (existing) {
            await this.chatRoomRepo.update(existing._id.toString(), {
                bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
                status: chatRoom_model_1.ChatRoomStatus.OPEN,
            });
            return (await this.chatRoomRepo.findById(existing._id.toString()));
        }
        return this.chatRoomRepo.create({
            bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
            userId: (0, mongoose_util_1.toObjectId)(userId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            status: chatRoom_model_1.ChatRoomStatus.OPEN,
        });
    }
    async authorizeRoomAccess(requestUserId, roomUserId, roomStylistId) {
        if (requestUserId === roomUserId)
            return;
        const mappedStylistId = await this.stylistRepo.findIdByUserId(requestUserId);
        if (mappedStylistId !== roomStylistId) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
    }
    async getRoomByBookingId(bookingId) {
        return this.chatRoomRepo.findByBookingId(bookingId);
    }
    async getUserRooms(userId, search) {
        return this.chatRoomRepo.findUserRooms(userId, search);
    }
    async getStylistRooms(userIdFromAuth, search) {
        const stylistId = await this.stylistRepo.findIdByUserId(userIdFromAuth);
        if (!stylistId)
            return [];
        return this.chatRoomRepo.findStylistRooms(stylistId, search);
    }
    async sendMessage(data) {
        const room = await this.chatRoomRepo.findById(data.chatRoomId, [
            { path: 'stylistId', select: 'userId' },
            { path: 'userId' },
        ]);
        if (!room) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (room.status === chatRoom_model_1.ChatRoomStatus.CLOSED) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_CLOSED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        await this.verifyRoomExpiry(data.chatRoomId);
        const rUserId = (0, mongoose_util_1.getIdString)(room.userId);
        const rStylistId = (0, mongoose_util_1.getIdString)(room.stylistId);
        if (data.senderType !== chat_types_1.SenderType.SYSTEM) {
            await this.authorizeRoomAccess(data.senderId, rUserId, rStylistId);
        }
        const message = await this.persistMessage(data, room.bookingId?.toString());
        const lastMsgPreview = this.getMessagePreview(data);
        await this.chatRoomRepo.updateLastMessage(data.chatRoomId, lastMsgPreview);
        this.handleMessagingNotification(room, data, lastMsgPreview).catch(() => { });
        return this.buildMessageResponseWithBooking(message, room.bookingId?.toString());
    }
    async persistMessage(data, bookingId) {
        return this.messageRepo.create({
            chatRoomId: (0, mongoose_util_1.toObjectId)(data.chatRoomId),
            senderId: (0, mongoose_util_1.toObjectId)(data.senderId),
            senderType: data.senderType,
            messageType: data.messageType,
            content: data.content,
            mediaUrl: data.mediaUrl,
            duration: data.duration,
            isRead: false,
            bookingId: bookingId ? (0, mongoose_util_1.toObjectId)(bookingId) : undefined,
        });
    }
    getMessagePreview(data) {
        switch (data.messageType) {
            case chat_types_1.MessageType.TEXT:
                return data.content || 'Text message';
            case chat_types_1.MessageType.IMAGE:
                return '📷 Image';
            case chat_types_1.MessageType.VOICE:
                return '🎤 Voice message';
            case chat_types_1.MessageType.SYSTEM:
                return data.content || 'System message';
            default:
                return 'New message';
        }
    }
    async buildMessageResponseWithBooking(message, bookingId) {
        if (!bookingId) {
            return chat_mapper_1.ChatMapper.toMessageResponse(message);
        }
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            return chat_mapper_1.ChatMapper.toMessageResponse(message);
        }
        const serviceName = (0, mongoose_util_1.getIdString)(booking.items?.[0]?.serviceId) || 'Service';
        return chat_mapper_1.ChatMapper.toMessageResponse(message, {
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            serviceName,
        });
    }
    async handleMessagingNotification(room, data, preview) {
        const stylistDoc = room.stylistId;
        const stylistUserId = (0, mongoose_util_1.getIdString)(stylistDoc?.userId);
        const roomUserId = (0, mongoose_util_1.getIdString)(room.userId);
        const isSenderStylist = data.senderId === stylistUserId;
        const recipientId = isSenderStylist ? roomUserId : stylistUserId;
        const link = isSenderStylist
            ? `/profile/chat?roomId=${data.chatRoomId}`
            : `/stylist/chat?roomId=${data.chatRoomId}`;
        let senderName = '';
        if (data.senderType !== chat_types_1.SenderType.SYSTEM) {
            const senderUser = await this.userRepo.findById(data.senderId);
            if (senderUser) {
                senderName = senderUser.name;
            }
        }
        const title = senderName ? `New Message from ${senderName}` : 'New Message';
        await this.notificationService.createNotification({
            recipientId,
            senderId: data.senderId,
            type: notification_model_1.NotificationType.CHAT_MESSAGE,
            title,
            message: preview,
            link,
        });
    }
    async getRoomMessages(roomId, limit, skip) {
        return this.messageRepo.findByRoomId(roomId, limit, skip);
    }
    async getAllRooms(limit = 50, skip = 0) {
        return this.chatRoomRepo.findAll(limit, skip);
    }
    async markMessagesAsRead(roomId, receiverId) {
        await this.messageRepo.markAsRead(roomId, receiverId);
    }
    async getUnreadCount(roomId, receiverId) {
        return this.messageRepo.countUnreadMessages(roomId, receiverId);
    }
    async getTotalUnreadCount(userId) {
        const stylistId = await this.stylistRepo.findIdByUserId(userId);
        const rooms = stylistId
            ? await this.chatRoomRepo.findStylistRooms(stylistId)
            : await this.chatRoomRepo.findUserRooms(userId);
        if (!rooms.length)
            return 0;
        const roomIds = rooms.map((r) => r._id.toString());
        return this.messageRepo.countTotalUnread(roomIds, userId);
    }
    async verifyRoomExpiry(roomId) {
        if (!(0, mongoose_util_1.isValidObjectId)(roomId)) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const room = await this.chatRoomRepo.findById(roomId, [{ path: 'bookingId' }]);
        if (!room) {
            throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const booking = room.bookingId;
        if (!booking)
            return;
        const isTerminated = booking.status === booking_model_1.BookingStatus.COMPLETED || booking.status === booking_model_1.BookingStatus.CANCELLED;
        if (isTerminated) {
            const now = Date.now();
            const actionAt = booking.status === booking_model_1.BookingStatus.COMPLETED ? booking.completedAt : booking.cancelledAt;
            if (actionAt && now - new Date(actionAt).getTime() > this.EXPIRY_WINDOW) {
                await this.chatRoomRepo.closeRoom(roomId);
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_EXPIRED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
            }
        }
    }
    async closeExpiredRooms() {
        return this.chatRoomRepo.closeExpiredRooms();
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ChatRoomRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.MessageRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ChatService);
