import mongoose, { Schema, Document } from 'mongoose';

export interface StylistServiceDocument extends Document {
  stylistId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StylistServiceSchema = new Schema<StylistServiceDocument>(
  {
    stylistId: { type: Schema.Types.ObjectId, ref: 'Stylist', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

StylistServiceSchema.index({ stylistId: 1, serviceId: 1 }, { unique: true });

export const StylistServiceModel =
  mongoose.models.StylistService ||
  mongoose.model<StylistServiceDocument>('StylistService', StylistServiceSchema);
