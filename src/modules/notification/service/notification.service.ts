import { injectable, inject } from 'tsyringe';
import { INotificationService, CreateNotificationDto } from './INotificationService';
import { INotificationRepository } from '../repository/INotificationRepository';
import { TOKENS } from '../../../common/di/tokens';
import { INotification } from '../../../models/notification.model';
import { SocketService } from '../../../socket/socket.service';
import { NotificationMapper } from '../mapper/notification.mapper';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TOKENS.NotificationRepository)
    private notificationRepo: INotificationRepository,
  ) {}

  async createNotification(data: CreateNotificationDto): Promise<INotification> {
    const notification = await this.notificationRepo.create({
      recipientId: toObjectId(data.recipientId),
      senderId: data.senderId ? toObjectId(data.senderId) : undefined,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    });

    SocketService.sendToUser(
      data.recipientId,
      'new_notification',
      NotificationMapper.toResponseDto(notification),
    );

    return notification;
  }

  async getUserNotifications(
    userId: string,
    isRead?: boolean,
    limit = 20,
    skip = 0,
  ): Promise<INotification[]> {
    return this.notificationRepo.findByRecipient(userId, isRead, limit, skip);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }
}
