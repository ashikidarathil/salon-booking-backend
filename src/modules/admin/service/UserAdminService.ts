import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { TOKENS } from '../../../common/di/tokens';
import { IUserAdminService } from './IUserAdminService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class UserAdminService implements IUserAdminService {
  constructor(@inject(TOKENS.UserRepository) private _userRepo: IUserRepository) {}

  async toggleBlockUser(userId: string, isBlocked: boolean): Promise<void> {
    try {
      await this._userRepo.setBlockedById(userId, isBlocked);
      console.log('setBlockedById completed');
    } catch (error) {
      console.error('Error in setBlockedById:', error);
    }
  }

  async getUsers(query: PaginationQueryDto) {
    return this._userRepo.getPaginated(query);
  }
}
