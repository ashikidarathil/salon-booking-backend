import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';

import type { IProfileService } from './IProfileService';
import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';

import type { IImageService } from '../../../common/service/image/IImageService';
import type { IUserRepository } from '../repository/IUserRepository';

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TOKENS.ImageService)
    private readonly imageService: IImageService,

    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async uploadProfilePicture(
    dto: UploadProfilePictureDto,
  ): Promise<UploadProfilePictureResponseDto> {
    const { userId, file } = dto;

    if (!file) {
      throw new AppError(MESSAGES.AUTH.NO_FILE_UPLOADED, HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const uploadedUrl = await this.imageService.uploadProfilePicture({
      file,
      userId,
      role: user.role,
    });

    if (user.profilePicture) {
      await this.imageService.deleteProfilePicture(user.profilePicture);
    }

    await this.userRepository.updateProfilePicture(userId, uploadedUrl);

    return {
      profilePicture: uploadedUrl,
    };
  }
}
