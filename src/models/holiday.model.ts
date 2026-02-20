import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  branchId: mongoose.Types.ObjectId | null;
  date: Date;
  name: string;
  isAllBranches: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isAllBranches: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

HolidaySchema.index({ branchId: 1, date: 1 }, { unique: true });

export const HolidayModel = mongoose.model<IHoliday>('Holiday', HolidaySchema);
