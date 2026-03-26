import type { ChangePasswordDto, UpdateProfileDto } from '../dto/auth.schema';
import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';
import type { ChangePasswordResponseDto } from '../dto/profile/ChangePassword.response';
import type { UpdateProfileResponseDto } from '../dto/profile/UpdateProfile.response';

export interface IProfileService {
  uploadProfilePicture(dto: UploadProfilePictureDto): Promise<UploadProfilePictureResponseDto>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResponseDto>;
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<UpdateProfileResponseDto>;
}
