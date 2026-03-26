import { INotification } from '../../../models/notification.model';

export interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByRecipient(
    userId: string,
    isRead?: boolean,
    limit?: number,
    skip?: number,
  ): Promise<INotification[]>;
  countUnread(userId: string): Promise<number>;
  markAsRead(id: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<void>;
  findById(id: string): Promise<INotification | null>;
}
