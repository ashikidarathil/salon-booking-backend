import mongoose, { Schema, Document } from 'mongoose';

export enum ChatRoomStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface IChatRoom extends Document {
  bookingId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  status: ChatRoomStatus;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'Stylist',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ChatRoomStatus),
      default: ChatRoomStatus.OPEN,
      index: true,
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Unique room per User-Stylist pair
ChatRoomSchema.index({ userId: 1, stylistId: 1 }, { unique: true });

export const ChatRoomModel = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
