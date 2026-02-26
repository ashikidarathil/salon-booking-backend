import mongoose, { Schema, Document } from 'mongoose';

export interface WishlistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<WishlistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stylistId: { type: Schema.Types.ObjectId, ref: 'Stylist', required: true },
  },
  { timestamps: true },
);

// Compound index to ensure a user can only favorite a stylist once
WishlistSchema.index({ userId: 1, stylistId: 1 }, { unique: true });

export const WishlistModel =
  mongoose.models.Wishlist || mongoose.model<WishlistDocument>('Wishlist', WishlistSchema);
