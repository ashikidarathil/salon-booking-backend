import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';

export interface IProfileService {
  uploadProfilePicture(dto: UploadProfilePictureDto): Promise<UploadProfilePictureResponseDto>;
}
