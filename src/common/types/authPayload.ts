import type { UserRole } from '../enums/userRole.enum';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  tabId?: string;
}
