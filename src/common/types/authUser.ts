import type { UserRole } from '../enums/userRole.enum';

export interface AuthUser {
  id: string;
  role: UserRole;
  isBlocked: boolean;
}
