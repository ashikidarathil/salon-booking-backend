import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { TOKENS } from '../../../common/di/tokens';
import { UserEntity } from '../../../common/types/userEntity';
import { IUserAdminService } from './IUserAdminService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class UserAdminService implements IUserAdminService {
  constructor(@inject(TOKENS.UserRepository) private _userRepo: IUserRepository) {
    console.log('UserAdminService constructor called');
    console.log('_userRepo is:', this._userRepo ? 'defined' : 'undefined');
    console.log('_userRepo type:', typeof this._userRepo);
  }

  // async getAllUsers(): Promise<UserEntity[]> {
  //   return this._userRepo.findAllByRole('USER');
  // }

  async toggleBlockUser(userId: string, isBlocked: boolean): Promise<void> {
    console.log('toggleBlockUser called with:', { userId, isBlocked });
    console.log('_userRepo.setBlockedById exists:', typeof this._userRepo.setBlockedById);

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
