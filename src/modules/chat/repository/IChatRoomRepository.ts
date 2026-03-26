import { PopulateOptions } from '../../../common/utils/mongoose.util';
import { IChatRoom } from '../../../models/chatRoom.model';

export interface IChatRoomRepository {
  create(data: Partial<IChatRoom>): Promise<IChatRoom>;
  findById(id: string, populate?: PopulateOptions[]): Promise<IChatRoom | null>;
  findByBookingId(bookingId: string): Promise<IChatRoom | null>;
  findByUserAndStylist(userId: string, stylistId: string): Promise<IChatRoom | null>;
  findUserRooms(userId: string, search?: string): Promise<IChatRoom[]>;
  findStylistRooms(stylistId: string, search?: string): Promise<IChatRoom[]>;
  findAll(limit?: number, skip?: number): Promise<IChatRoom[]>;
  updateLastMessage(roomId: string, message: string): Promise<void>;
  update(id: string, data: Partial<IChatRoom>): Promise<IChatRoom | null>;
  closeRoom(roomId: string): Promise<void>;
  closeExpiredRooms(): Promise<number>;
}
