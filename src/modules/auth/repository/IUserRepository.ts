import { UserRole } from '../../../common/enums/userRole.enum';
import { UserEntity } from '../../../common/types/userEntity';
import { UserDocument } from '../../../models/user.model';
import type { UserStatus } from '../../../models/user.model';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  status: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export type UpdateInvitedStylistInput = {
  name: string;
  phone?: string;
  password: string;
  isActive: boolean;
};

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;
  findByEmailOrPhone(identifier: string): Promise<UserEntity | null>;
  update(filter: Record<string, unknown>, data: Partial<UserDocument>): Promise<UserEntity | null>;
  createUser(data: CreateUserInput): Promise<UserEntity>;
  markEmailVerified(email: string): Promise<UserEntity | null>;
  updatePassword(email: string, hashedPassword: string): Promise<UserEntity | null>;
  createGoogleUser(data: { name: string; email: string; googleId: string }): Promise<UserEntity>;
  markPhoneVerifiedByPhone(phone: string): Promise<UserEntity | null>;
  updateInvitedStylist(
    userId: string,
    data: { name: string; phone?: string; password: string; isActive: boolean },
  ): Promise<boolean>;
  setActiveById(userId: string, isActive: boolean): Promise<void>;
  setBlockedById(userId: string, isBlocked: boolean): Promise<void>;
  setStatusById(userId: string, status: UserStatus): Promise<void>;
  updateProfilePicture(userId: string, pictureUrl: string): Promise<UserEntity>;
  findAllByRole(role: string): Promise<UserEntity[]>;
  getPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<UserEntity>>;

  // New methods for profile management
  findByIdWithPassword(userId: string): Promise<UserEntity | null>;
  updatePasswordById(userId: string, hashedPassword: string): Promise<UserEntity | null>;
  updateProfile(
    userId: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<UserEntity | null>;
}
