"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
class NotificationMapper {
    static toResponseDto(doc) {
        return {
            id: doc._id.toString(),
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
    static toResponseDtoList(docs) {
        return docs.map((doc) => this.toResponseDto(doc));
    }
}
exports.NotificationMapper = NotificationMapper;
