import { IChatRoom } from '../../../models/chatRoom.model';
import { IMessage } from '../../../models/message.model';
import { ChatRoomResponseDto, MessageResponseDto } from '../dto/chat.response.dto';

import {
  PopulatedUserRef,
  PopulatedStylistRef,
  PopulatedBookingRef,
  PopulatedBookingMessageRef,
} from '../types/chat.types';

export class ChatMapper {
  static toRoomResponse(room: IChatRoom): ChatRoomResponseDto {
    const userDoc = room.userId as unknown as PopulatedUserRef;
    const userName = userDoc?.name;
    const userProfilePic = userDoc?.profilePicture;

    const stylistDoc = room.stylistId as unknown as PopulatedStylistRef;
    const stylistUserDoc = stylistDoc?.userId;
    const stylistName = stylistUserDoc?.name;
    const stylistProfilePic = stylistDoc?.profilePicture ?? stylistUserDoc?.profilePicture;

    const bookingDoc = room.bookingId as unknown as PopulatedBookingRef;

    return {
      id: room._id.toString(),
      bookingId: bookingDoc?._id ? bookingDoc._id.toString() : (bookingDoc?.toString() ?? ''),
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

  static toMessageResponse(
    message: IMessage,
    externalBooking?: { bookingNumber: string; status: string; serviceName?: string },
  ): MessageResponseDto {
    const bookingDoc = message.bookingId as unknown as PopulatedBookingMessageRef | null;

    let bookingPayload: MessageResponseDto['bookingId'] = undefined;

    if (externalBooking) {
      bookingPayload = {
        bookingNumber: externalBooking.bookingNumber,
        status: externalBooking.status,
        bookingName: externalBooking.serviceName || 'Service',
      };
    } else if (bookingDoc && typeof bookingDoc === 'object' && 'bookingNumber' in bookingDoc) {
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
      bookingId: bookingPayload ?? message.bookingId?.toString(),
    };
  }
}
