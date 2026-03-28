import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  branchIds: mongoose.Types.ObjectId[];
  date: Date;
  name: string;
  isAllBranches: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    branchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        index: true,
      },
    ],
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

HolidaySchema.index({ date: 1, name: 1 }, { unique: true });

export const HolidayModel = mongoose.model<IHoliday>('Holiday', HolidaySchema);
