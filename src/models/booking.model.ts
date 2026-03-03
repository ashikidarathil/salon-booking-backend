import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
  SPECIAL = 'SPECIAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface IBookingItem {
  serviceId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  price: number;
  duration: number;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  slotId?: mongoose.Types.ObjectId; // Kept for backward compatibility or primary slot
  items: IBookingItem[];
  stylistId: mongoose.Types.ObjectId; // Primary stylist (usually the one people associate the booking with)
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledBy?: 'USER' | 'ADMIN' | 'STYLIST' | 'SYSTEM';
  cancelledReason?: string;
  cancelledAt?: Date;
  extensionReason?: string;
  rescheduleCount: number;
  rescheduleReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: false,
      index: true,
    },
    items: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        stylistId: {
          type: Schema.Types.ObjectId,
          ref: 'Stylist',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'Stylist',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    cancelledBy: {
      type: String,
      enum: ['USER', 'ADMIN', 'STYLIST', 'SYSTEM'],
    },
    cancelledReason: {
      type: String,
      maxlength: 200,
    },
    cancelledAt: {
      type: Date,
    },
    extensionReason: {
      type: String,
      maxlength: 200,
    },
    rescheduleCount: {
      type: Number,
      default: 0,
    },
    rescheduleReason: {
      type: String,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  },
);

BookingSchema.index(
  { branchId: 1, stylistId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: 'CONFIRMED' } },
);
BookingSchema.index({ stylistId: 1, date: 1 });
BookingSchema.index({ 'items.stylistId': 1, date: 1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
