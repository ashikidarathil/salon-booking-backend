import mongoose, { Schema, Document } from 'mongoose';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

export interface IWithdrawalRequest extends Document {
  stylistId: mongoose.Types.ObjectId;
  amount: number;
  status: WithdrawalStatus;
  // Timestamps for each action
  approvedAt?: Date;
  paidAt?: Date;
  processedAt?: Date;
  // Admin tracking
  paidByAdminId?: mongoose.Types.ObjectId;
  paymentReferenceNumber?: string;
  // Rejection
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(WithdrawalStatus),
      default: WithdrawalStatus.PENDING,
      required: true,
      index: true,
    },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    processedAt: { type: Date },
    paidByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentReferenceNumber: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

export const WithdrawalRequestModel = mongoose.model<IWithdrawalRequest>(
  'WithdrawalRequest',
  WithdrawalRequestSchema,
);
