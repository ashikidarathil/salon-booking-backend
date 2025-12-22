import { UserRole } from '../../../common/enums/UserRole.enum';

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
