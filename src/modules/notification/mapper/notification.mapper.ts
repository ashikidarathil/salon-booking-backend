import { INotification } from '../../../models/notification.model';
import { NotificationResponseDto } from '../dto/notification.response.dto';
import { ObjectId } from '../../../common/utils/mongoose.util';

export class NotificationMapper {
  static toResponseDto(doc: INotification): NotificationResponseDto {
    return {
      id: (doc._id as ObjectId).toString(),
      recipientId: doc.recipientId.toString(),
      senderId: doc.senderId?.toString(),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      link: doc.link,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
    };
  }

  static toResponseDtoList(docs: INotification[]): NotificationResponseDto[] {
    return docs.map((doc) => this.toResponseDto(doc));
  }
}
