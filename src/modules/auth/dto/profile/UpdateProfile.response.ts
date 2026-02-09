import type { SafeUser } from '../../types/SafeUser.type';

export interface UpdateProfileResponseDto {
  success: boolean;
  message: string;
  user: SafeUser;
}
