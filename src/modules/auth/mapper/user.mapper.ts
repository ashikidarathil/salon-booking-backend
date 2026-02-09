import type { UserEntity } from '../../../common/types/userEntity';
import type { SafeUser } from '../types/SafeUser.type';

export class UserMapper {
  static toSafeUser(user: UserEntity): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture ?? null,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      authProvider: user.authProvider,
    };
  }
}
