import type { SafeUser } from '../../types/SafeUser.type';

export interface LoginResponseDto {
  user: SafeUser;
  token: string;
}
