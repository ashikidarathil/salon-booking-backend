import mongoose, { Schema, Document } from 'mongoose';
import { AppError } from '../common/errors/appError';
import { HttpStatus } from '../common/enums/httpStatus.enum';
import { MESSAGES } from '../common/constants/messages';

interface IShift {
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

/**
 * Stylist Daily Override Document Interface
 * Overrides the weekly pattern for specific dates (holidays, special hours, events)
 */
export interface IStylistDailyOverride extends Document {
  stylistId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  date: Date;
  isWorkingDay: boolean;
  shifts: IShift[];
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shift Schema
 */
const ShiftSchema = new Schema<IShift>(
  {
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
    breakStart: {
      type: String,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    breakEnd: {
      type: String,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  { _id: false },
);

/**
 * Stylist Daily Override Schema
 */
const StylistDailyOverrideSchema = new Schema<IStylistDailyOverride>(
  {
    stylistId: {
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    isWorkingDay: {
      type: Boolean,
      required: true,
      default: false,
    },
    shifts: {
      type: [ShiftSchema],
      default: [],
    },
    reason: {
      type: String,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  },
);

StylistDailyOverrideSchema.index({ stylistId: 1, branchId: 1, date: 1 }, { unique: true });

StylistDailyOverrideSchema.index({ date: 1 });

StylistDailyOverrideSchema.pre('save', function () {
  if (this.isWorkingDay && this.shifts.length === 0) {
    throw new AppError(MESSAGES.STYLIST_SCHEDULE.WORKING_DAY_NEEDS_SHIFT, HttpStatus.BAD_REQUEST);
  }
});

export const StylistDailyOverrideModel = mongoose.model<IStylistDailyOverride>(
  'StylistDailyOverride',
  StylistDailyOverrideSchema,
);
