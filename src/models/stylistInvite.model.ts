import mongoose, { Schema, Document } from 'mongoose';

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export interface StylistInviteDocument extends Document {
  email: string;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  rawToken: string;
  inviteLink: string;
  expiresAt: Date;
  status: InviteStatus;
  usedAt?: Date;
  specialization: string;
  experience: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StylistInviteSchema = new Schema<StylistInviteDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, index: true },
    rawToken: {
      type: String,
      required: true,
    },
    inviteLink: {
      type: String,
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
    },
    usedAt: { type: Date },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

StylistInviteSchema.index({ email: 1, status: 1 });

export const StylistInviteModel =
  mongoose.models.StylistInvite ||
  mongoose.model<StylistInviteDocument>('StylistInvite', StylistInviteSchema);
