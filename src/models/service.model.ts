import mongoose, { Schema } from 'mongoose';

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
