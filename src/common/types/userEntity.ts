import { UserRole } from '../enums/userRole.enum';
import { AuthProvider } from '../enums/authProvider.enum';
import type { UserStatus } from '../../models/user.model';

export interface UserEntity {
  id: string;
  name: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  password?: string;
  authProvider: AuthProvider;
  googleId?: string;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  status: UserStatus;
  profilePicture?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
