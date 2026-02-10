import mongoose, { Schema, Document } from 'mongoose';

export interface StylistBranchDocument extends Document {
  stylistId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  isActive: boolean;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  unassignedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const StylistBranchSchema = new Schema<StylistBranchDocument>(
  {
    stylistId: { type: Schema.Types.ObjectId, ref: 'Stylist', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },

    isActive: { type: Boolean, default: true, index: true },

    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },

    unassignedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

StylistBranchSchema.index(
  { stylistId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

StylistBranchSchema.index({ branchId: 1, isActive: 1 });

export const StylistBranchModel =
  mongoose.models.StylistBranch ||
  mongoose.model<StylistBranchDocument>('StylistBranch', StylistBranchSchema);
