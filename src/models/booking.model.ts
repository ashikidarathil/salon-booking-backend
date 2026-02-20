import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  slotId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledBy?: 'USER' | 'ADMIN' | 'SYSTEM';
  cancelledReason?: string;
  cancelledAt?: Date;
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
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      enum: ['USER', 'ADMIN', 'SYSTEM'],
    },
    cancelledReason: {
      type: String,
      maxlength: 200,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

BookingSchema.index({ branchId: 1, stylistId: 1, date: 1, startTime: 1 }, { unique: true });
BookingSchema.index({ stylistId: 1, date: 1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
