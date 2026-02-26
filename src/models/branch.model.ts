import { Schema, model, Document } from 'mongoose';

export interface BranchDocument extends Document {
  name: string;
  address: string;
  phone?: string;
  isDeleted: boolean;
  latitude: number;
  longitude: number;
  defaultBreaks: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
export type IBranch = BranchDocument;

const branchSchema = new Schema<BranchDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    defaultBreaks: {
      type: [
        {
          startTime: String,
          endTime: String,
          description: String,
        },
      ],
      default: [
        { startTime: '13:00', endTime: '14:00', description: 'Lunch Break' },
        { startTime: '16:00', endTime: '16:30', description: 'Tea Break' },
      ],
    },
  },
  {
    timestamps: true,
  },
);

branchSchema.index({ latitude: 1, longitude: 1 });

export const BranchModel = model<BranchDocument>('Branch', branchSchema);
