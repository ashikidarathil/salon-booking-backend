import mongoose, { Schema, Document } from 'mongoose';

export interface StylistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  experience: number;
  rating: number;
  bio?: string;
  status: 'ACTIVE' | 'INACTIVE';
  position: 'JUNIOR' | 'SENIOR' | 'TRAINEE';
  profilePicture?: string;
  allowChat: boolean;
  earningsBalance: number;
  pendingPayout: number;
  createdAt: Date;
  updatedAt: Date;
}

const StylistSchema = new Schema<StylistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0 },
    bio: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'INACTIVE' },
    position: {
      type: String,
      enum: ['JUNIOR', 'SENIOR', 'TRAINEE'],
      default: 'TRAINEE',
    },
    profilePicture: { type: String },
    allowChat: { type: Boolean, default: true },
    earningsBalance: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const StylistModel =
  mongoose.models.Stylist || mongoose.model<StylistDocument>('Stylist', StylistSchema);
