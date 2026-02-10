import mongoose, { Schema, Document } from 'mongoose';
import { AppError } from '../common/errors/appError';
import { HttpStatus } from '../common/enums/httpStatus.enum';
import { MESSAGES } from '../common/constants/messages';

/**
 * Off-day type enum
 */
export enum OffDayType {
  SICK_LEAVE = 'SICK_LEAVE',
  VACATION = 'VACATION',
  PERSONAL = 'PERSONAL',
  EMERGENCY = 'EMERGENCY',
}

/**
 * Off-day status enum
 */
export enum OffDayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Stylist Off-Day Document Interface
 * Tracks stylist leave requests, vacations, and approved off-days
 */
export interface IStylistOffDay extends Document {
  stylistId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: OffDayType;
  status: OffDayStatus;
  reason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stylist Off-Day Schema
 */
const StylistOffDaySchema = new Schema<IStylistOffDay>(
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
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(OffDayType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OffDayStatus),
      required: true,
      default: OffDayStatus.PENDING,
      index: true,
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

StylistOffDaySchema.index({ stylistId: 1, branchId: 1, startDate: 1, endDate: 1 });
StylistOffDaySchema.index({ status: 1, branchId: 1 });

StylistOffDaySchema.pre('save', function () {
  if (this.endDate < this.startDate) {
    throw new AppError(MESSAGES.STYLIST_SCHEDULE.END_DATE_BEFORE_START, HttpStatus.BAD_REQUEST);
  }
});

StylistOffDaySchema.pre('save', function () {
  if (this.isModified('status') && this.status !== OffDayStatus.PENDING) {
    if (!this.approvedAt) {
      this.approvedAt = new Date();
    }
  }
});

export const StylistOffDayModel = mongoose.model<IStylistOffDay>(
  'StylistOffDay',
  StylistOffDaySchema,
);
