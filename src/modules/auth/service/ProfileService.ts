import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { S3Service } from '../../../common/service/s3/S3Service';
import type { IUserRepository } from '../repository/IUserRepository';
import type { IAuthService } from './IAuthService';
import { IProfileService } from './IProfileService'; // ← NEW

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(S3Service) private readonly s3: S3Service,
    @inject(TOKENS.UserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.AuthService) private readonly authService: IAuthService,
  ) {}

  async uploadPicture(userId: string, file: Express.Multer.File) {
    const user = await this.authService.me(userId);

    const url = await this.s3.uploadProfilePicture({
      file,
      userId,
      role: user.role,
    });

    if (user.profilePicture) {
      await this.s3.deleteProfilePicture(user.profilePicture);
    }

    await this.userRepo.updateProfilePicture(userId, url);

    return { profilePicture: url };
  }
}
