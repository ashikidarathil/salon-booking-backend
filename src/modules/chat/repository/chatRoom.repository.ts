import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { ChatRoomModel, ChatRoomStatus, IChatRoom } from '../../../models/chatRoom.model';
import { IChatRoomRepository } from './IChatRoomRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';

// Typed interfaces for populated references within this repository
interface PopulatedStylistSearch {
  userId?: { name?: string };
}

interface PopulatedBookingSearch {
  bookingNumber?: string;
}

@injectable()
export class ChatRoomRepository
  extends BaseRepository<IChatRoom, IChatRoom>
  implements IChatRoomRepository
{
  constructor() {
    super(ChatRoomModel);
  }

  protected toEntity(doc: IChatRoom): IChatRoom {
    return doc;
  }

  async findByBookingId(bookingId: string): Promise<IChatRoom | null> {
    return this.findOne({ bookingId: toObjectId(bookingId) });
  }

  async findByUserAndStylist(userId: string, stylistId: string): Promise<IChatRoom | null> {
    return this.findOne({
      userId: toObjectId(userId),
      stylistId: toObjectId(stylistId),
    });
  }

  async findUserRooms(userId: string, search?: string): Promise<IChatRoom[]> {
    const rooms = await this.find(
      { userId: toObjectId(userId) },
      [
        {
          path: 'stylistId',
          select: 'userId profilePicture',
          populate: { path: 'userId', select: 'name profilePicture' },
        },
        { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
      ],
      { lastMessageAt: -1 },
    );

    if (!search) return rooms;

    const lowerSearch = search.toLowerCase();
    return rooms.filter((room) => {
      const stylist = room.stylistId as unknown as PopulatedStylistSearch;
      const booking = room.bookingId as unknown as PopulatedBookingSearch;
      const stylistName = stylist?.userId?.name?.toLowerCase() ?? '';
      const bookingRef = booking?.bookingNumber?.toLowerCase() ?? '';
      return stylistName.includes(lowerSearch) || bookingRef.includes(lowerSearch);
    });
  }

  async findStylistRooms(stylistId: string, search?: string): Promise<IChatRoom[]> {
    const rooms = await this.find(
      { stylistId: toObjectId(stylistId) },
      [
        { path: 'userId', select: 'name profilePicture' },
        { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
      ],
      { lastMessageAt: -1 },
    );

    if (!search) return rooms;

    const lowerSearch = search.toLowerCase();
    return rooms.filter((room) => {
      const user = room.userId as unknown as { name?: string };
      const booking = room.bookingId as unknown as PopulatedBookingSearch;
      const userName = user?.name?.toLowerCase() ?? '';
      const bookingRef = booking?.bookingNumber?.toLowerCase() ?? '';
      return userName.includes(lowerSearch) || bookingRef.includes(lowerSearch);
    });
  }

  async findAll(limit = 50, skip = 0): Promise<IChatRoom[]> {
    const docs = await this._model
      .find()
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'userId', select: 'name profilePicture' },
        {
          path: 'stylistId',
          select: 'userId profilePicture',
          populate: { path: 'userId', select: 'name profilePicture' },
        },
        { path: 'bookingId', select: 'bookingNumber status completedAt cancelledAt' },
      ])
      .exec();
    return docs.map((d) => this.toEntity(d));
  }

  async updateLastMessage(roomId: string, message: string): Promise<void> {
    await this.update(roomId, {
      lastMessage: message,
      lastMessageAt: new Date(),
    });
  }

  async closeRoom(roomId: string): Promise<void> {
    await this._model.updateOne(
      { _id: toObjectId(roomId) },
      { $set: { status: ChatRoomStatus.CLOSED } },
    );
  }

  async closeExpiredRooms(): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredRooms = await this._model
      .find({ status: ChatRoomStatus.OPEN })
      .populate({
        path: 'bookingId',
        select: 'status completedAt cancelledAt',
        match: {
          $or: [
            { status: 'COMPLETED', completedAt: { $lt: cutoff } },
            { status: 'CANCELLED', cancelledAt: { $lt: cutoff } },
          ],
        },
      })
      .select('_id')
      .exec();

    // Only rooms where the populate matched (booking not null)
    const roomIdsToClose = expiredRooms.filter((r) => r.bookingId != null).map((r) => r._id);

    if (roomIdsToClose.length === 0) return 0;

    await this._model.updateMany(
      { _id: { $in: roomIdsToClose } },
      { $set: { status: ChatRoomStatus.CLOSED } },
    );

    return roomIdsToClose.length;
  }
}
