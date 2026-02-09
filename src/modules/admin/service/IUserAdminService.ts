import { UserEntity } from '../../../common/types/userEntity';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IUserAdminService {
  // getAllUsers(): Promise<UserEntity[]>;
  toggleBlockUser(userId: string, isBlocked: boolean): Promise<void>;
  getUsers(query: PaginationQueryDto): Promise<PaginatedResponse<UserEntity>>;
}
