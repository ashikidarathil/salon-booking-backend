import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { NotificationModel, INotification } from '../../../models/notification.model';
import { INotificationRepository } from './INotificationRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class NotificationRepository
  extends BaseRepository<INotification, INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  protected toEntity(doc: INotification): INotification {
    return doc;
  }

  async findByRecipient(
    userId: string,
    isRead?: boolean,
    limit = 20,
    skip = 0,
  ): Promise<INotification[]> {
    const filter: Record<string, unknown> = { recipientId: toObjectId(userId) };
    if (isRead !== undefined) {
      filter.isRead = isRead;
    }


    const docs = await this._model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return docs.map((d) => this.toEntity(d));
  }

  async countUnread(userId: string): Promise<number> {
    return this._model.countDocuments({
      recipientId: toObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this._model.updateMany(
      { recipientId: toObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
  }
}
