import mongoose, { Schema, Document } from 'mongoose';

export interface IStylistWallet extends Document {
  stylistId: mongoose.Types.ObjectId;
  withdrawableBalance: number;
  pendingWithdrawal: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StylistWalletSchema = new Schema<IStylistWallet>(
  {
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    withdrawableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pendingWithdrawal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const StylistWalletModel = mongoose.model<IStylistWallet>(
  'StylistWallet',
  StylistWalletSchema,
);
