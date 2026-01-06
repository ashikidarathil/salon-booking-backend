import { UserEntity } from '../../../types/userEntity';

export interface IUserAdminService {
  getAllUsers(): Promise<UserEntity[]>;
  toggleBlockUser(userId: string, isBlocked: boolean): Promise<void>;
}
