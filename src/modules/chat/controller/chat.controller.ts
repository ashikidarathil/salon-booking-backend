import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IChatService } from '../service/IChatService';
import { TOKENS } from '../../../common/di/tokens';
import { AuthPayload } from '../../../common/types/authPayload';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ApiResponse } from '../../../common/response/apiResponse';
import { CHAT_MESSAGES } from '../constants/chat.messages';
import { ChatMapper } from '../mapper/chat.mapper';
import { IImageService } from '../../../common/service/image/IImageService';
import { AppError } from '../../../common/errors/appError';
import { isValidObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class ChatController {
  constructor(
    @inject(TOKENS.ChatService) private readonly chatService: IChatService,
    @inject(TOKENS.ImageService) private readonly imageService: IImageService,
  ) {}

  initializeRoom = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { bookingId } = req.body;
    if (!bookingId || !isValidObjectId(bookingId)) {
      throw new AppError(CHAT_MESSAGES.BOOKING_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const userId = req.auth!.userId;
    const room = await this.chatService.initializeRoom(bookingId, userId);

    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(CHAT_MESSAGES.ROOM_CREATED, ChatMapper.toRoomResponse(room)),
      );
  };

  getUserRooms = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const userId = req.auth!.userId;
    const rooms = await this.chatService.getUserRooms(userId);

    res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(CHAT_MESSAGES.FETCHED, rooms.map(ChatMapper.toRoomResponse)));
  };

  getStylistRooms = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const userId = req.auth!.userId;
    const rooms = await this.chatService.getStylistRooms(userId);

    res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(CHAT_MESSAGES.FETCHED, rooms.map(ChatMapper.toRoomResponse)));
  };

  getAllRoomsAdmin = async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const rooms = await this.chatService.getAllRooms(limit, skip);

    res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(CHAT_MESSAGES.FETCHED, rooms.map(ChatMapper.toRoomResponse)));
  };

  getRoomMessages = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const messages = await this.chatService.getRoomMessages(roomId, limit, skip);
    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(CHAT_MESSAGES.FETCHED, messages.map(ChatMapper.toMessageResponse)),
      );
  };

  markAsRead = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { roomId } = req.params;
    const userId = req.auth!.userId;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    await this.chatService.markMessagesAsRead(roomId, userId);

    res.status(HttpStatus.OK).json(ApiResponse.success(CHAT_MESSAGES.MESSAGES_READ));
  };

  getUnreadCount = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { roomId } = req.params;
    const userId = req.auth!.userId;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const count = await this.chatService.getUnreadCount(roomId, userId);
    res.status(HttpStatus.OK).json(ApiResponse.success(CHAT_MESSAGES.FETCHED, { count }));
  };

  uploadMedia = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { file } = req;
    const { roomId } = req.body;
    const senderId = req.auth!.userId;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (!file) {
      throw new AppError(CHAT_MESSAGES.UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
    }

    await this.chatService.verifyRoomExpiry(roomId);

    let mediaUrl: string;
    if (file.mimetype.startsWith('audio/')) {
      mediaUrl = await this.imageService.uploadAudio({ file, roomId, senderId });
    } else if (file.mimetype.startsWith('image/')) {
      mediaUrl = await this.imageService.uploadChatImage({ file, roomId, senderId });
    } else {
      throw new AppError(CHAT_MESSAGES.UNSUPPORTED_MEDIA, HttpStatus.BAD_REQUEST);
    }

    res.status(HttpStatus.OK).json(ApiResponse.success(CHAT_MESSAGES.MESSAGE_SENT, { mediaUrl }));
  };
}
