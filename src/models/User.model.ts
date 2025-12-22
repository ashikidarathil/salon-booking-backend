import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../common/enums/UserRole.enum';

export interface UserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('User', UserSchema);
