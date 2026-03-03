import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: 'BOOKING' | 'ESCROW' | 'DEPOSIT' | 'WITHDRAWAL';
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.COMPLETED,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['BOOKING', 'ESCROW', 'DEPOSIT', 'WITHDRAWAL'],
    },
  },
  {
    timestamps: true,
  },
);

export const WalletTransactionModel = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  WalletTransactionSchema,
);
