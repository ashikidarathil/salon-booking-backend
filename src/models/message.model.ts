import mongoose, { Schema, Document } from 'mongoose';
import { MessageType, SenderType } from '../modules/chat/constants/chat.types';

export interface IMessage extends Document {
  chatRoomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderType: SenderType;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  isRead: boolean;
  bookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: Object.values(SenderType),
      required: true,
    },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
      default: MessageType.TEXT,
    },
    content: {
      type: String,
    },
    mediaUrl: {
      type: String,
    },
    duration: {
      type: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fetching history efficiently
MessageSchema.index({ chatRoomId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
