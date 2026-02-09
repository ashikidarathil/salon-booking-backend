import mongoose, { Schema, Document } from 'mongoose';

export interface BranchCategoryDocument extends Document {
  branchId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BranchCategorySchema = new Schema<BranchCategoryDocument>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

BranchCategorySchema.index({ branchId: 1, categoryId: 1 }, { unique: true });

export const BranchCategoryModel =
  mongoose.models.BranchCategory ||
  mongoose.model<BranchCategoryDocument>('BranchCategory', BranchCategorySchema);
