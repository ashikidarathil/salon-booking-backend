import { UserEntity } from '../../../../types/UserEntity';
import { UserRole } from '../../../../common/enums/userRole.enum';

export class AuthMapper {
  static toLoginResponse(user: UserEntity, token: string) {
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }
}
