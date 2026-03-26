import { MessageType, SenderType } from '../constants/chat.types';

export interface ChatRoomResponseDto {
  id: string;
  bookingId: string;
  bookingNumber?: string;
  userId: string;
  userName?: string;
  userProfilePic?: string;
  stylistId: string;
  stylistName?: string;
  stylistProfilePic?: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  updatedAt: Date;
  // Nested objects for admin / detailed views
  user?: { name: string; profilePicture?: string };
  stylist?: { name: string; profilePicture?: string };
  booking?: { bookingNumber?: string; status: string; completedAt?: string; cancelledAt?: string };
}

export interface MessageResponseDto {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: SenderType;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  isRead: boolean;
  createdAt: Date;
  bookingId?:
    | string
    | {
        bookingNumber: string;
        status: string;
        bookingName?: string;
      };
}
