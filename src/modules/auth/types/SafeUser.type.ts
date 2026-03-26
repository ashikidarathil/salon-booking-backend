import { UserRole } from '../../../common/enums/userRole.enum';
import { AuthProvider } from '../../../common/enums/authProvider.enum';

export interface SafeUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  profilePicture?: string | null;
  isActive: boolean;
  isBlocked: boolean;
  authProvider?: AuthProvider;
  branchId?: string;
  bio?: string;
}
