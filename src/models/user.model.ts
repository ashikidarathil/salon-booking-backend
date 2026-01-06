import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../common/enums/userRole.enum';
import { AuthProvider } from '../common/enums/authProvider.enum';

export type UserStatus = 'APPLIED' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

export interface UserDocument extends Document {
  name: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  password: string;
  authProvider: AuthProvider;
  googleId?: string;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  status: UserStatus;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    emailVerified: { type: Boolean, default: false },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phoneVerified: { type: Boolean, default: false },

    password: {
      type: String,
      required: function (this: UserDocument) {
        return this.authProvider === AuthProvider.LOCAL && this.status !== 'APPLIED';
      },
      select: false,
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    googleId: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['APPLIED', 'PENDING', 'ACCEPTED', 'ACTIVE', 'REJECTED', 'EXPIRED'],
      default: 'ACTIVE',
    },
    profilePicture: { type: String, default: null },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('User', UserSchema);
