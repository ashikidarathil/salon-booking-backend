import { injectable, inject } from 'tsyringe';
import { IChatService } from './IChatService';
import { SendMessageDto } from '../dto/chat.request.dto';
import { TOKENS } from '../../../common/di/tokens';
import { IChatRoomRepository } from '../repository/IChatRoomRepository';
import { IMessageRepository } from '../repository/IMessageRepository';
import { INotificationService } from '../../notification/service/INotificationService';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { IChatRoom, ChatRoomStatus } from '../../../models/chatRoom.model';
import { IMessage } from '../../../models/message.model';
import { NotificationType } from '../../../models/notification.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { CHAT_MESSAGES } from '../constants/chat.messages';
import { toObjectId, isValidObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { MessageType, SenderType } from '../constants/chat.types';
import { ChatMapper } from '../mapper/chat.mapper';
import { MessageResponseDto } from '../dto/chat.response.dto';

function extractId(
  ref: string | ObjectId | { _id: ObjectId | string } | undefined,
): string {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (ref instanceof ObjectId) return ref.toString();
  if (typeof ref === 'object' && '_id' in ref) return ref._id.toString();
  return (ref as unknown as { toString(): string }).toString();
}

@injectable()
export class ChatService implements IChatService {
  private readonly EXPIRY_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    @inject(TOKENS.ChatRoomRepository) private readonly chatRoomRepo: IChatRoomRepository,
    @inject(TOKENS.MessageRepository) private readonly messageRepo: IMessageRepository,
    @inject(TOKENS.NotificationService) private readonly notificationService: INotificationService,
    @inject(TOKENS.BookingRepository) private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.StylistRepository) private readonly stylistRepo: IStylistRepository,
  ) {}

  async initializeRoom(bookingId: string, requestUserId: string): Promise<IChatRoom> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(CHAT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(CHAT_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const bUserId = this.extractId(booking.userId);
    const bStylistId = this.extractId(booking.stylistId);

    // Verify requesting user is part of the booking
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
      // Re-open and link to latest booking
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

  async getUserRooms(userId: string): Promise<IChatRoom[]> {
    return this.chatRoomRepo.findUserRooms(userId);
  }

  async getStylistRooms(userIdFromAuth: string): Promise<IChatRoom[]> {
    const stylistId = await this.stylistRepo.findIdByUserId(userIdFromAuth);
    if (!stylistId) return [];
    return this.chatRoomRepo.findStylistRooms(stylistId);
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

    // Softened expiry check
    await this.verifyRoomExpiry(data.chatRoomId);

    const rUserId = this.extractId(room.userId);
    const rStylistId = this.extractId(room.stylistId);

    if (data.senderType !== SenderType.SYSTEM) {
      await this.authorizeRoomAccess(data.senderId, rUserId, rStylistId);
    }

    const message = await this.persistMessage(data, room.bookingId?.toString());
    const lastMsgPreview = this.getMessagePreview(data);

    await this.chatRoomRepo.updateLastMessage(data.chatRoomId, lastMsgPreview);

    // Trigger notification
    await this.handleMessagingNotification(room, data, lastMsgPreview);

    // Map to response and enrich with booking details
    return this.enrichMessageResponse(message, room.bookingId?.toString());
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

  private async handleMessagingNotification(
    room: IChatRoom,
    data: SendMessageDto,
    preview: string,
  ): Promise<void> {
    const stylistUserId = this.extractId(
      (room.stylistId as unknown as { userId: ObjectId }).userId,
    );
    const roomUserId = this.extractId(room.userId);

    const isSenderStylist = data.senderId === stylistUserId;
    const recipientId = isSenderStylist ? roomUserId : stylistUserId;

    const link = isSenderStylist
      ? `/profile/chat?roomId=${data.chatRoomId}`
      : `/stylist/chat?roomId=${data.chatRoomId}`;

    this.notificationService
      .createNotification({
        recipientId,
        senderId: data.senderId,
        type: NotificationType.CHAT_MESSAGE,
        title: 'New Message',
        message: preview,
        link,
      })
      .catch((err) => console.error('Failed to create chat notification:', err));
  }

  private async enrichMessageResponse(
    message: IMessage,
    bookingId?: string,
  ): Promise<MessageResponseDto> {
    const mapped = ChatMapper.toMessageResponse(message);

    if (bookingId) {
      const booking = await this.bookingRepo.findById(bookingId);
      if (booking) {
        mapped.bookingId = {
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          bookingName:
            (
              booking.items?.[0] as unknown as { serviceId?: { name?: string } }
            )?.serviceId?.name || 'Service',
        };
      }
    }

    return mapped;
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

  async verifyRoomExpiry(roomId: string): Promise<void> {
    if (!isValidObjectId(roomId)) {
      throw new AppError(CHAT_MESSAGES.ROOM_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const room = await this.chatRoomRepo.findById(roomId, [{ path: 'bookingId' }]);
    if (!room) {
      throw new AppError(CHAT_MESSAGES.ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const booking = room.bookingId as unknown as {
      status?: string;
      completedAt?: Date;
      cancelledAt?: Date;
    } | null;
    if (!booking) return;

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      const now = new Date().getTime();
      const actionAt = booking.status === 'COMPLETED' ? booking.completedAt : booking.cancelledAt;

      if (actionAt) {
        const actionTime = new Date(actionAt).getTime();
        if (now - actionTime > this.EXPIRY_WINDOW) {
          await this.chatRoomRepo.closeRoom(roomId);
          throw new AppError(CHAT_MESSAGES.ROOM_EXPIRED, HttpStatus.FORBIDDEN);
        }
      }
    }
  }

  async closeExpiredRooms(): Promise<number> {
    return this.chatRoomRepo.closeExpiredRooms();
  }

  private extractId(ref: string | ObjectId | { _id: ObjectId | string } | undefined): string {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    if (ref instanceof ObjectId) return ref.toString();
    if (typeof ref === 'object' && '_id' in ref) return ref._id.toString();
    return (ref as unknown as { toString(): string }).toString();
  }
}
