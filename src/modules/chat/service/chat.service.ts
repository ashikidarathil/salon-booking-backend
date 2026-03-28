import { injectable, inject } from 'tsyringe';
import { IChatService } from './IChatService';
import { SendMessageDto } from '../dto/chat.request.dto';
import { TOKENS } from '../../../common/di/tokens';
import { IChatRoomRepository } from '../repository/IChatRoomRepository';
import { IMessageRepository } from '../repository/IMessageRepository';
import { INotificationService } from '../../notification/service/INotificationService';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { IChatRoom, ChatRoomStatus } from '../../../models/chatRoom.model';
import { IMessage } from '../../../models/message.model';
import { NotificationType } from '../../../models/notification.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { CHAT_MESSAGES } from '../constants/chat.messages';
import { toObjectId, isValidObjectId, getIdString } from '../../../common/utils/mongoose.util';
import { MessageType, SenderType } from '../constants/chat.types';
import { ChatMapper } from '../mapper/chat.mapper';
import { MessageResponseDto } from '../dto/chat.response.dto';
import { BookingStatus } from '../../../models/booking.model';

import { PopulatedBookingExpiry, PopulatedStylistWithUser } from '../types/chat.types';

@injectable()
export class ChatService implements IChatService {
  private readonly EXPIRY_WINDOW = 24 * 60 * 60 * 1000;

  constructor(
    @inject(TOKENS.ChatRoomRepository) private readonly chatRoomRepo: IChatRoomRepository,
    @inject(TOKENS.MessageRepository) private readonly messageRepo: IMessageRepository,
    @inject(TOKENS.NotificationService) private readonly notificationService: INotificationService,
    @inject(TOKENS.BookingRepository) private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.StylistRepository) private readonly stylistRepo: IStylistRepository,
    @inject(TOKENS.UserRepository) private readonly userRepo: IUserRepository,
  ) {}

  async initializeRoom(bookingId: string, requestUserId: string): Promise<IChatRoom> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(CHAT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(CHAT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const bUserId = getIdString(booking.userId);
    const bStylistId = getIdString(booking.stylistId);

    await this.authorizeRoomAccess(requestUserId, bUserId, bStylistId);

    return this.findOrCreateRoom(bookingId, bUserId, bStylistId);
  }

  async createRoom(bookingId: string, userId: string, stylistId: string): Promise<IChatRoom> {
    return this.findOrCreateRoom(bookingId, userId, stylistId);
  }

  private async findOrCreateRoom(
    bookingId: string,
    userId: string,
    stylistId: string,
  ): Promise<IChatRoom> {
    const existing = await this.chatRoomRepo.findByUserAndStylist(userId, stylistId);

    if (existing) {
      await this.chatRoomRepo.update(existing._id.toString(), {
        bookingId: toObjectId(bookingId),
        status: ChatRoomStatus.OPEN,
      });
      return (await this.chatRoomRepo.findById(existing._id.toString()))!;
    }

    return this.chatRoomRepo.create({
      bookingId: toObjectId(bookingId),
      userId: toObjectId(userId),
      stylistId: toObjectId(stylistId),
      status: ChatRoomStatus.OPEN,
    });
  }

  private async authorizeRoomAccess(
    requestUserId: string,
    roomUserId: string,
    roomStylistId: string,
  ): Promise<void> {
    if (requestUserId === roomUserId) return;

    const mappedStylistId = await this.stylistRepo.findIdByUserId(requestUserId);
    if (mappedStylistId !== roomStylistId) {
      throw new AppError(CHAT_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
  }

  async getRoomByBookingId(bookingId: string): Promise<IChatRoom | null> {
    return this.chatRoomRepo.findByBookingId(bookingId);
  }

  async getUserRooms(userId: string, search?: string): Promise<IChatRoom[]> {
    return this.chatRoomRepo.findUserRooms(userId, search);
  }

  async getStylistRooms(userIdFromAuth: string, search?: string): Promise<IChatRoom[]> {
    const stylistId = await this.stylistRepo.findIdByUserId(userIdFromAuth);
    if (!stylistId) return [];
    return this.chatRoomRepo.findStylistRooms(stylistId, search);
  }

  async sendMessage(data: SendMessageDto): Promise<MessageResponseDto> {
    const room = await this.chatRoomRepo.findById(data.chatRoomId, [
      { path: 'stylistId', select: 'userId' },
      { path: 'userId' },
    ]);

    if (!room) {
      throw new AppError(CHAT_MESSAGES.ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (room.status === ChatRoomStatus.CLOSED) {
      throw new AppError(CHAT_MESSAGES.ROOM_CLOSED, HttpStatus.FORBIDDEN);
    }

    await this.verifyRoomExpiry(data.chatRoomId);

    const rUserId = getIdString(room.userId);
    const rStylistId = getIdString(room.stylistId);

    if (data.senderType !== SenderType.SYSTEM) {
      await this.authorizeRoomAccess(data.senderId, rUserId, rStylistId);
    }

    const message = await this.persistMessage(data, room.bookingId?.toString());
    const lastMsgPreview = this.getMessagePreview(data);

    await this.chatRoomRepo.updateLastMessage(data.chatRoomId, lastMsgPreview);

    this.handleMessagingNotification(room, data, lastMsgPreview).catch(() => {});

    return this.buildMessageResponseWithBooking(message, room.bookingId?.toString());
  }

  private async persistMessage(data: SendMessageDto, bookingId?: string): Promise<IMessage> {
    return this.messageRepo.create({
      chatRoomId: toObjectId(data.chatRoomId),
      senderId: toObjectId(data.senderId),
      senderType: data.senderType,
      messageType: data.messageType,
      content: data.content,
      mediaUrl: data.mediaUrl,
      duration: data.duration,
      isRead: false,
      bookingId: bookingId ? toObjectId(bookingId) : undefined,
    });
  }

  private getMessagePreview(data: SendMessageDto): string {
    switch (data.messageType) {
      case MessageType.TEXT:
        return data.content || 'Text message';
      case MessageType.IMAGE:
        return '📷 Image';
      case MessageType.VOICE:
        return '🎤 Voice message';
      case MessageType.SYSTEM:
        return data.content || 'System message';
      default:
        return 'New message';
    }
  }

  private async buildMessageResponseWithBooking(
    message: IMessage,
    bookingId?: string,
  ): Promise<MessageResponseDto> {
    if (!bookingId) {
      return ChatMapper.toMessageResponse(message);
    }

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      return ChatMapper.toMessageResponse(message);
    }

    const serviceName = getIdString(booking.items?.[0]?.serviceId) || 'Service';

    return ChatMapper.toMessageResponse(message, {
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      serviceName,
    });
  }

  private async handleMessagingNotification(
    room: IChatRoom,
    data: SendMessageDto,
    preview: string,
  ): Promise<void> {
    const stylistDoc = room.stylistId as unknown as PopulatedStylistWithUser;
    const stylistUserId = getIdString(stylistDoc?.userId);
    const roomUserId = getIdString(room.userId);

    const isSenderStylist = data.senderId === stylistUserId;
    const recipientId = isSenderStylist ? roomUserId : stylistUserId;

    const link = isSenderStylist
      ? `/profile/chat?roomId=${data.chatRoomId}`
      : `/stylist/chat?roomId=${data.chatRoomId}`;

    let senderName = '';
    if (data.senderType !== SenderType.SYSTEM) {
      const senderUser = await this.userRepo.findById(data.senderId);
      if (senderUser) {
        senderName = senderUser.name;
      }
    }

    const title = senderName ? `New Message from ${senderName}` : 'New Message';

    await this.notificationService.createNotification({
      recipientId,
      senderId: data.senderId,
      type: NotificationType.CHAT_MESSAGE,
      title,
      message: preview,
      link,
    });
  }

  async getRoomMessages(roomId: string, limit?: number, skip?: number): Promise<IMessage[]> {
    return this.messageRepo.findByRoomId(roomId, limit, skip);
  }

  async getAllRooms(limit = 50, skip = 0): Promise<IChatRoom[]> {
    return this.chatRoomRepo.findAll(limit, skip);
  }

  async markMessagesAsRead(roomId: string, receiverId: string): Promise<void> {
    await this.messageRepo.markAsRead(roomId, receiverId);
  }

  async getUnreadCount(roomId: string, receiverId: string): Promise<number> {
    return this.messageRepo.countUnreadMessages(roomId, receiverId);
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const stylistId = await this.stylistRepo.findIdByUserId(userId);
    const rooms = stylistId
      ? await this.chatRoomRepo.findStylistRooms(stylistId)
      : await this.chatRoomRepo.findUserRooms(userId);

    if (!rooms.length) return 0;

    const roomIds = rooms.map((r) => r._id.toString());
    return this.messageRepo.countTotalUnread(roomIds, userId);
  }

  async verifyRoomExpiry(roomId: string): Promise<void> {
    if (!isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const room = await this.chatRoomRepo.findById(roomId, [{ path: 'bookingId' }]);
    if (!room) {
      throw new AppError(CHAT_MESSAGES.ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const booking = room.bookingId as unknown as PopulatedBookingExpiry | null;
    if (!booking) return;

    const isTerminated =
      booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED;

    if (isTerminated) {
      const now = Date.now();
      const actionAt =
        booking.status === BookingStatus.COMPLETED ? booking.completedAt : booking.cancelledAt;

      if (actionAt && now - new Date(actionAt).getTime() > this.EXPIRY_WINDOW) {
        await this.chatRoomRepo.closeRoom(roomId);
        throw new AppError(CHAT_MESSAGES.ROOM_EXPIRED, HttpStatus.FORBIDDEN);
      }
    }
  }

  async closeExpiredRooms(): Promise<number> {
    return this.chatRoomRepo.closeExpiredRooms();
  }
}
