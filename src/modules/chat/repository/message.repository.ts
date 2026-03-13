import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { MessageModel, IMessage } from '../../../models/message.model';
import { IMessageRepository } from './IMessageRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class MessageRepository
  extends BaseRepository<IMessage, IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  protected toEntity(doc: IMessage): IMessage {
    return doc;
  }

  async findByRoomId(roomId: string, limit = 50, skip = 0): Promise<IMessage[]> {
    const docs = await this._model
      .find({ chatRoomId: toObjectId(roomId) })
      .sort({ createdAt: -1 }) // Get newest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'bookingId',
        select: 'bookingNumber status items',
        populate: {
          path: 'items.serviceId',
          select: 'name'
        }
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc)).reverse(); // Reverse to return chronological order
  }

  async markAsRead(roomId: string, receiverId: string): Promise<void> {
    await this._model.updateMany(
      {
        chatRoomId: toObjectId(roomId),
        senderId: { $ne: toObjectId(receiverId) },
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );
  }

  async countUnreadMessages(roomId: string, receiverId: string): Promise<number> {
    return this.count({
      chatRoomId: toObjectId(roomId),
      senderId: { $ne: toObjectId(receiverId) },
      isRead: false,
    });
  }
}
