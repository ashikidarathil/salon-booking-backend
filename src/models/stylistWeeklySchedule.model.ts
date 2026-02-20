import mongoose, { Schema, Document } from 'mongoose';
import { AppError } from '../common/errors/appError';
import { HttpStatus } from '../common/enums/httpStatus.enum';
import { MESSAGES } from '../common/constants/messages';

/**
 * Shift time slot interface
 */
interface IShift {
  startTime: string;
  endTime: string;
}

/**
 * Stylist Weekly Schedule Document Interface
 * Defines the default weekly working pattern for a stylist at a specific branch
 */
export interface IStylistWeeklySchedule extends Document {
  stylistId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  isWorkingDay: boolean;
  shifts: IShift[];
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
  },
  { _id: false },
);

/**
 * Stylist Weekly Schedule Schema
 */
const StylistWeeklyScheduleSchema = new Schema<IStylistWeeklySchedule>(
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
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      index: true,
    },
    isWorkingDay: {
      type: Boolean,
      required: true,
      default: true,
    },
    shifts: {
      type: [ShiftSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

StylistWeeklyScheduleSchema.index({ stylistId: 1, branchId: 1, dayOfWeek: 1 }, { unique: true });

StylistWeeklyScheduleSchema.pre('save', function () {
  if (this.isWorkingDay && this.shifts.length === 0) {
    throw new AppError(MESSAGES.STYLIST_SCHEDULE.WORKING_DAY_NEEDS_SHIFT, HttpStatus.BAD_REQUEST);
  }
});

export const StylistWeeklyScheduleModel = mongoose.model<IStylistWeeklySchedule>(
  'StylistWeeklySchedule',
  StylistWeeklyScheduleSchema,
);
