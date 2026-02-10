import mongoose, { Schema, Types } from 'mongoose';
import { CategoryStatus } from './category.model';

export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface ServiceDocument extends mongoose.Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  imageUrl?: string;
  whatIncluded?: string[];
  status: ServiceStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type ServiceLean = {
  _id: Types.ObjectId;
  name: string;
  categoryId?: {
    _id: Types.ObjectId;
    name: string;
    status: CategoryStatus;
    isDeleted: boolean;
  };
  imageUrl?: string;
  description?: string;
  whatIncluded?: string[];
  status: ServiceStatus;
  isDeleted: boolean;
};

const ServiceSchema = new Schema<ServiceDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    imageUrl: { type: String, default: null },
    whatIncluded: {
      type: [String],
      default: [],
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ServiceSchema.index(
  { name: 1, categoryId: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  },
);
ServiceSchema.index({ name: 'text', description: 'text' });

export const ServiceModel = mongoose.model<ServiceDocument>('Service', ServiceSchema);
