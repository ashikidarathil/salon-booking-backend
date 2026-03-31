import { IChatRoom } from '../../../models/chatRoom.model';
import { IMessage } from '../../../models/message.model';
import { ChatRoomResponseDto, MessageResponseDto } from '../dto/chat.response.dto';
import { SendMessageDto } from '../dto/chat.request.dto';

export interface IChatService {
  initializeRoom(bookingId: string, requestUserId: string): Promise<IChatRoom>;
  createRoom(bookingId: string, userId: string, stylistId: string): Promise<IChatRoom>;
  getRoomByBookingId(bookingId: string): Promise<IChatRoom | null>;
  getUserRooms(userId: string, search?: string): Promise<IChatRoom[]>;
  getStylistRooms(stylistId: string, search?: string): Promise<IChatRoom[]>;
  getUserRoomsEnriched(userId: string, search?: string): Promise<ChatRoomResponseDto[]>;
  getStylistRoomsEnriched(userIdFromAuth: string, search?: string): Promise<ChatRoomResponseDto[]>;
  sendMessage(data: SendMessageDto): Promise<MessageResponseDto>;
  getRoomMessages(roomId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  getAllRooms(limit?: number, skip?: number): Promise<IChatRoom[]>;
  markMessagesAsRead(roomId: string, receiverId: string): Promise<void>;
  getUnreadCount(roomId: string, receiverId: string): Promise<number>;
  getTotalUnreadCount(userId: string): Promise<number>;
  verifyRoomExpiry(roomId: string): Promise<void>;
  closeExpiredRooms(): Promise<number>;
}
