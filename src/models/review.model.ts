import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    stylistId: { type: Schema.Types.ObjectId, ref: 'Stylist', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
ReviewSchema.index({ stylistId: 1, createdAt: -1 });
ReviewSchema.index({ serviceId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
