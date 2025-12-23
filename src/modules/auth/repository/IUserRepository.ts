import { UserRole } from '../../../common/enums/userRole.enum';
import { UserEntity } from '../../../types/UserEntity';

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  createUser(data: CreateUserInput): Promise<UserEntity>;
  activateUser(email: string): Promise<UserEntity | null>;
  updatePassword(email: string, hashedPassword: string): Promise<UserEntity | null>;
}
