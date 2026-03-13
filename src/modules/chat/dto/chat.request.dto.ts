import { SenderType, MessageType } from '../constants/chat.types';

export interface InitializeRoomDto {
  bookingId: string;
}

export interface SendMessageDto {
  chatRoomId: string;
  senderId: string;
  senderType: SenderType;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
}

export interface PaginationDto {
  limit?: number;
  skip?: number;
}
