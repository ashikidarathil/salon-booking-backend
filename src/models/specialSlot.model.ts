import mongoose, { Schema, Document } from 'mongoose';

export enum SpecialSlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
}

export interface ISpecialSlot extends Document {
  branchId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number;
  status: SpecialSlotStatus;
  note?: string;
  createdBy: mongoose.Types.ObjectId; // userId of the creator
  createdAt: Date;
  updatedAt: Date;
}

const SpecialSlotSchema = new Schema<ISpecialSlot>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    stylistId: { type: Schema.Types.ObjectId, ref: 'Stylist', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(SpecialSlotStatus),
      default: SpecialSlotStatus.AVAILABLE,
    },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Index for quick queries in availability checks
SpecialSlotSchema.index({ branchId: 1, date: 1, status: 1 });
SpecialSlotSchema.index({ stylistId: 1, date: 1 });

export const SpecialSlotModel = mongoose.model<ISpecialSlot>('SpecialSlot', SpecialSlotSchema);
