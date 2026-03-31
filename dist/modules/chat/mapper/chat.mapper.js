"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toRoomResponse(room) {
        const userDoc = room.userId;
        const userName = userDoc?.name;
        const userProfilePic = userDoc?.profilePicture;
        const stylistDoc = room.stylistId;
        const stylistUserDoc = stylistDoc?.userId;
        const stylistName = stylistUserDoc?.name;
        const stylistProfilePic = stylistDoc?.profilePicture ?? stylistUserDoc?.profilePicture;
        const bookingDoc = room.bookingId;
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
            lastMessageType: room.lastMessageType,
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
    static toMessageResponse(message, externalBooking) {
        const bookingDoc = message.bookingId;
        let bookingPayload = undefined;
        if (externalBooking) {
            bookingPayload = {
                bookingNumber: externalBooking.bookingNumber,
                status: externalBooking.status,
                bookingName: externalBooking.serviceName || 'Service',
            };
        }
        else if (bookingDoc && typeof bookingDoc === 'object' && 'bookingNumber' in bookingDoc) {
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
exports.ChatMapper = ChatMapper;
