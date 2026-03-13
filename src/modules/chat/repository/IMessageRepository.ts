import { IMessage } from '../../../models/message.model';

export interface IMessageRepository {
  create(data: Partial<IMessage>): Promise<IMessage>;
  findByRoomId(roomId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  markAsRead(roomId: string, receiverId: string): Promise<void>;
  countUnreadMessages(roomId: string, receiverId: string): Promise<number>;
}
