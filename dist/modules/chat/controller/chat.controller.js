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
exports.ChatController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const apiResponse_1 = require("../../../common/response/apiResponse");
const chat_messages_1 = require("../constants/chat.messages");
const chat_mapper_1 = require("../mapper/chat.mapper");
const appError_1 = require("../../../common/errors/appError");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let ChatController = class ChatController {
    constructor(chatService, imageService) {
        this.chatService = chatService;
        this.imageService = imageService;
        this.initializeRoom = async (req, res) => {
            const { bookingId } = req.body;
            if (!bookingId || !(0, mongoose_util_1.isValidObjectId)(bookingId)) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.BOOKING_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const userId = req.auth.userId;
            const room = await this.chatService.initializeRoom(bookingId, userId);
            return apiResponse_1.ApiResponse.success(res, chat_mapper_1.ChatMapper.toRoomResponse(room), chat_messages_1.CHAT_MESSAGES.ROOM_CREATED);
        };
        this.getUserRooms = async (req, res) => {
            const userId = req.auth.userId;
            const search = req.query.search;
            const rooms = await this.chatService.getUserRoomsEnriched(userId, search);
            return apiResponse_1.ApiResponse.success(res, rooms, chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.getStylistRooms = async (req, res) => {
            const userId = req.auth.userId;
            const search = req.query.search;
            const rooms = await this.chatService.getStylistRoomsEnriched(userId, search);
            return apiResponse_1.ApiResponse.success(res, rooms, chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.getAllRoomsAdmin = async (req, res) => {
            const limit = req.query.limit ? parseInt(req.query.limit) : 50;
            const skip = req.query.skip ? parseInt(req.query.skip) : 0;
            const rooms = await this.chatService.getAllRooms(limit, skip);
            return apiResponse_1.ApiResponse.success(res, rooms.map(chat_mapper_1.ChatMapper.toRoomResponse), chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.getRoomMessages = async (req, res) => {
            const { roomId } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit) : 50;
            const skip = req.query.skip ? parseInt(req.query.skip) : 0;
            if (!roomId || !(0, mongoose_util_1.isValidObjectId)(roomId)) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const messages = await this.chatService.getRoomMessages(roomId, limit, skip);
            return apiResponse_1.ApiResponse.success(res, messages.map((m) => chat_mapper_1.ChatMapper.toMessageResponse(m)), chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.markAsRead = async (req, res) => {
            const { roomId } = req.params;
            const userId = req.auth.userId;
            if (!roomId || !(0, mongoose_util_1.isValidObjectId)(roomId)) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            await this.chatService.markMessagesAsRead(roomId, userId);
            return apiResponse_1.ApiResponse.success(res, null, chat_messages_1.CHAT_MESSAGES.MESSAGES_READ);
        };
        this.getUnreadCount = async (req, res) => {
            const { roomId } = req.params;
            const userId = req.auth.userId;
            if (!roomId || !(0, mongoose_util_1.isValidObjectId)(roomId)) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const count = await this.chatService.getUnreadCount(roomId, userId);
            return apiResponse_1.ApiResponse.success(res, { count }, chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.getTotalUnreadCount = async (req, res) => {
            const userId = req.auth.userId;
            const count = await this.chatService.getTotalUnreadCount(userId);
            return apiResponse_1.ApiResponse.success(res, { count }, chat_messages_1.CHAT_MESSAGES.FETCHED);
        };
        this.uploadMedia = async (req, res) => {
            const { file } = req;
            const { roomId } = req.body;
            const senderId = req.auth.userId;
            if (!roomId || !(0, mongoose_util_1.isValidObjectId)(roomId)) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.ROOM_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            if (!file) {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.UPLOAD_FAILED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            await this.chatService.verifyRoomExpiry(roomId);
            let mediaUrl;
            if (file.mimetype.startsWith('audio/')) {
                mediaUrl = await this.imageService.uploadAudio({ file, roomId, senderId });
            }
            else if (file.mimetype.startsWith('image/')) {
                mediaUrl = await this.imageService.uploadChatImage({ file, roomId, senderId });
            }
            else {
                throw new appError_1.AppError(chat_messages_1.CHAT_MESSAGES.UNSUPPORTED_MEDIA, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            return apiResponse_1.ApiResponse.success(res, { mediaUrl }, chat_messages_1.CHAT_MESSAGES.MESSAGE_SENT);
        };
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ChatService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ImageService)),
    __metadata("design:paramtypes", [Object, Object])
], ChatController);
