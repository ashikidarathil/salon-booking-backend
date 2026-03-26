import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { TOKENS } from '../../../common/di/tokens';
import { IUserAdminService } from './IUserAdminService';
import { UserPaginationQueryDto } from '../dto/admin.dto';

@injectable()
export class UserAdminService implements IUserAdminService {
  constructor(@inject(TOKENS.UserRepository) private _userRepo: IUserRepository) {}

  async toggleBlockUser(userId: string, isBlocked: boolean): Promise<void> {
    await this._userRepo.setBlockedById(userId, isBlocked);
  }

  async getUsers(query: UserPaginationQueryDto) {
    return this._userRepo.getPaginated(query);
  }

  async getProfile(userId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getDashboardStats() {
    // Basic implementation for now, can be expanded if needed
    return {
      totalUsers: await this._userRepo.count({}),
      // Other stats will be handled by specialized controllers
    };
  }
}
