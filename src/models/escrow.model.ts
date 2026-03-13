import mongoose, { Schema, Document } from 'mongoose';

export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
}

export interface IEscrow extends Document {
  bookingId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  amount: number;
  status: EscrowStatus;
  releaseMonth: string; // Format: YYYY-MM eg. "2026-03"
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema = new Schema<IEscrow>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'Stylist',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(EscrowStatus),
      default: EscrowStatus.HELD,
      index: true,
    },
    releaseMonth: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const EscrowModel = mongoose.model<IEscrow>('Escrow', EscrowSchema);
