// backend/src/modules/admin/service/UserAdminService.ts

import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { TOKENS } from '../../../common/di/tokens';
import { UserEntity } from '../../../types/userEntity';
import { IUserAdminService } from './IUserAdminService';

@injectable()
export class UserAdminService implements IUserAdminService {
  constructor(@inject(TOKENS.UserRepository) private userRepo: IUserRepository) {}

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.findAllByRole('USER');
  }

  async toggleBlockUser(userId: string, isBlocked: boolean): Promise<void> {
    await this.userRepo.setBlockedById(userId, isBlocked);
  }
}
