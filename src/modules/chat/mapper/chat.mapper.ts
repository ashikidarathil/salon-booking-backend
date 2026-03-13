import { ObjectId } from '../../../common/utils/mongoose.util';
import { IChatRoom } from '../../../models/chatRoom.model';
import { IMessage } from '../../../models/message.model';
import { ChatRoomResponseDto, MessageResponseDto } from '../dto/chat.response.dto';

export class ChatMapper {
  static toRoomResponse(room: IChatRoom): ChatRoomResponseDto {
    const userDoc = room.userId as unknown as {
      _id?: string | ObjectId;
      name?: string;
      profilePicture?: string;
    };
    const userName = userDoc?.name;
    const userProfilePic = userDoc?.profilePicture;

    const stylistDoc = room.stylistId as unknown as {
      _id?: string | ObjectId;
      userId?: { name?: string; profilePicture?: string };
      profilePicture?: string;
    };
    const stylistUserDoc = stylistDoc?.userId; 
    const stylistName = stylistUserDoc?.name;
    const stylistProfilePic =
      stylistDoc?.profilePicture ?? stylistUserDoc?.profilePicture;

    const bookingDoc = room.bookingId as unknown as {
      _id?: string | ObjectId;
      bookingNumber?: string;
      status?: string;
      completedAt?: Date;
      cancelledAt?: Date;
    };

    return {
      id: room._id.toString(),
      bookingId: bookingDoc?._id ? bookingDoc._id.toString() : bookingDoc?.toString(),
      bookingNumber: bookingDoc?.bookingNumber,
      userId: userDoc?._id ? userDoc._id.toString() : room.userId?.toString(),
      userName,
      userProfilePic,
      stylistId: stylistDoc?._id ? stylistDoc._id.toString() : room.stylistId?.toString(),
      stylistName,
      stylistProfilePic,
      status: room.status,
      lastMessage: room.lastMessage,
      lastMessageAt: room.lastMessageAt,
      updatedAt: room.updatedAt,
      // Nested objects used by AdminChatPage
      ...(userName !== undefined && {
        user: { name: userName, profilePicture: userProfilePic },
      }),
      ...(stylistName !== undefined && {
        stylist: { name: stylistName, profilePicture: stylistProfilePic },
      }),
      ...(bookingDoc?.bookingNumber !== undefined && {
        booking: {
          bookingNumber: bookingDoc.bookingNumber,
          status: bookingDoc.status || 'UNKNOWN',
          completedAt: bookingDoc.completedAt?.toISOString(),
          cancelledAt: bookingDoc.cancelledAt?.toISOString(),
        },
      }),
    };
  }




  static toMessageResponse(message: IMessage): MessageResponseDto {
    const bookingDoc = message.bookingId as unknown as {
      bookingNumber?: string;
      status?: string;
      items?: { serviceId?: { name?: string } }[];
    } | null;
    let bookingPayload: MessageResponseDto['bookingId'] = undefined;

    if (bookingDoc) {
      const firstItem = bookingDoc.items?.[0];
      const serviceName = firstItem?.serviceId?.name || 'Service';

      bookingPayload = {
        bookingNumber: bookingDoc.bookingNumber || '',
        status: bookingDoc.status || '',
        bookingName: serviceName,
      };
    }

    return {
      id: message._id.toString(),
      chatRoomId: message.chatRoomId.toString(),
      senderId: message.senderId.toString(),
      senderType: message.senderType,
      messageType: message.messageType,
      content: message.content,
      mediaUrl: message.mediaUrl,
      duration: message.duration,
      isRead: message.isRead,
      createdAt: message.createdAt,
      bookingId: bookingPayload || message.bookingId?.toString(),
    };
  }
}
