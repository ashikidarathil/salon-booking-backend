import mongoose, { Schema, Document } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  expiryDate: Date;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
  isDeleted: boolean;
  applicableServices?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minBookingAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    applicableServices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema);
