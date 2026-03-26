import { INotification, NotificationType } from '../../../models/notification.model';

export interface CreateNotificationDto {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export interface INotificationService {
  createNotification(data: CreateNotificationDto): Promise<INotification>;
  getUserNotifications(
    userId: string,
    isRead?: boolean,
    limit?: number,
    skip?: number,
  ): Promise<INotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
