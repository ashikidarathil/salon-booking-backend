import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bookingId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  method?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    method: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
