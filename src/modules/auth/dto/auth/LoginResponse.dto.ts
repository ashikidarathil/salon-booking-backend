import type { SafeUser } from '../../types/SafeUser.type';

export interface LoginResponseDto {
  user: SafeUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
