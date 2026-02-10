import mongoose, { Schema, Types } from 'mongoose';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryDocument extends mongoose.Document {
  name: string;
  description?: string;
  status: CategoryStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedCategory {
  _id: Types.ObjectId;
  name: string;
  status: CategoryStatus;
  isDeleted: boolean;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

CategorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  },
);
export const CategoryModel = mongoose.model<CategoryDocument>('Category', CategorySchema);
