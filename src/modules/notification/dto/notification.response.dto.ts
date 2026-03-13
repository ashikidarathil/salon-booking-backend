import { NotificationType } from '../../../models/notification.model';

export interface NotificationResponseDto {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UnreadCountResponseDto {
  unreadCount: number;
}
