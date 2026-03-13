import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformRevenue extends Document {
  bookingId: mongoose.Types.ObjectId;
  escrowId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  amount: number;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformRevenueSchema = new Schema<IPlatformRevenue>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    escrowId: {
      type: Schema.Types.ObjectId,
      ref: 'Escrow',
      required: true,
    },
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 0.4,
    },
  },
  { timestamps: true },
);

export const PlatformRevenueModel = mongoose.model<IPlatformRevenue>(
  'PlatformRevenue',
  PlatformRevenueSchema,
);
