import { UserRole } from '../../../common/enums/userRole.enum';

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
