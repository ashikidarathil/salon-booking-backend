import mongoose, { Schema, Document } from 'mongoose';

export interface BranchServiceDocument extends Document {
  branchId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  price: number;
  duration: number;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BranchServiceSchema = new Schema<BranchServiceDocument>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

BranchServiceSchema.index({ branchId: 1, serviceId: 1 }, { unique: true });

export const BranchServiceModel =
  mongoose.models.BranchService ||
  mongoose.model<BranchServiceDocument>('BranchService', BranchServiceSchema);
