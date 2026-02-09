import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';
import type { ChangePasswordDto } from '../dto/profile/ChangePassword.request';
import type { ChangePasswordResponseDto } from '../dto/profile/ChangePassword.response';
import type { UpdateProfileDto } from '../dto/profile/UpdateProfile.request';
import type { UpdateProfileResponseDto } from '../dto/profile/UpdateProfile.response';

export interface IProfileService {
  uploadProfilePicture(dto: UploadProfilePictureDto): Promise<UploadProfilePictureResponseDto>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResponseDto>;
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<UpdateProfileResponseDto>;
}
