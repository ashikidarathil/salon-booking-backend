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

    return ApiResponse.success(res, ChatMapper.toRoomResponse(room), CHAT_MESSAGES.ROOM_CREATED);
  };

  getUserRooms = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth!.userId;
    const search = req.query.search as string | undefined;
    const rooms = await this.chatService.getUserRooms(userId, search);

    return ApiResponse.success(res, rooms.map(ChatMapper.toRoomResponse), CHAT_MESSAGES.FETCHED);
  };

  getStylistRooms = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth!.userId;
    const search = req.query.search as string | undefined;
    const rooms = await this.chatService.getStylistRooms(userId, search);

    return ApiResponse.success(res, rooms.map(ChatMapper.toRoomResponse), CHAT_MESSAGES.FETCHED);
  };

  getAllRoomsAdmin = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const rooms = await this.chatService.getAllRooms(limit, skip);

    return ApiResponse.success(res, rooms.map(ChatMapper.toRoomResponse), CHAT_MESSAGES.FETCHED);
  };

  getRoomMessages = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const messages = await this.chatService.getRoomMessages(roomId, limit, skip);
    return ApiResponse.success(
      res,
      messages.map((m) => ChatMapper.toMessageResponse(m)),
      CHAT_MESSAGES.FETCHED,
    );
  };

  markAsRead = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const { roomId } = req.params;
    const userId = req.auth!.userId;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    await this.chatService.markMessagesAsRead(roomId, userId);

    return ApiResponse.success(res, null, CHAT_MESSAGES.MESSAGES_READ);
  };

  getUnreadCount = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const { roomId } = req.params;
    const userId = req.auth!.userId;

    if (!roomId || !isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const count = await this.chatService.getUnreadCount(roomId, userId);
    return ApiResponse.success(res, { count }, CHAT_MESSAGES.FETCHED);
  };

  getTotalUnreadCount = async (req: Request & { auth?: AuthPayload }, res: Response) => {
    const userId = req.auth!.userId;
    const count = await this.chatService.getTotalUnreadCount(userId);
    return ApiResponse.success(res, { count }, CHAT_MESSAGES.FETCHED);
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

    return ApiResponse.success(res, { mediaUrl }, CHAT_MESSAGES.MESSAGE_SENT);
  };
}
