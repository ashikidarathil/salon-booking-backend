import mongoose, { Schema, Document } from 'mongoose';

/**
 * Stylist Break Document Interface
 * Stores recurring breaks (by dayOfWeek) or specifically for a date
 */
export interface IStylistBreak extends Document {
  stylistId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  dayOfWeek?: number; // 0-6
  date?: Date; // Specific date for one-off breaks
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StylistBreakSchema = new Schema<IStylistBreak>(
  {
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'Stylist',
      required: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      index: true,
    },
    date: {
      type: Date,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    description: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a stylist doesn't have overlapping breaks (optional but good)
// For now, simpler: indices for fast lookup
StylistBreakSchema.index({ stylistId: 1, branchId: 1, dayOfWeek: 1 });
StylistBreakSchema.index({ stylistId: 1, branchId: 1, date: 1 });

export const StylistBreakModel = mongoose.model<IStylistBreak>('StylistBreak', StylistBreakSchema);
