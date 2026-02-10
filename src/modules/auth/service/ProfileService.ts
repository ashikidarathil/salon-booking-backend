import { injectable, inject } from 'tsyringe';
import bcrypt from 'bcrypt';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';

import type { IProfileService } from './IProfileService';
import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';
import type { ChangePasswordDto } from '../dto/profile/ChangePassword.request';
import type { ChangePasswordResponseDto } from '../dto/profile/ChangePassword.response';
import type { UpdateProfileDto } from '../dto/profile/UpdateProfile.request';
import type { UpdateProfileResponseDto } from '../dto/profile/UpdateProfile.response';

import type { IImageService } from '../../../common/service/image/IImageService';
import type { IUserRepository } from '../repository/IUserRepository';
import { UserMapper } from '../mapper/user.mapper';

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

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResponseDto> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppError('New password and confirm password do not match', HttpStatus.BAD_REQUEST);
    }

    if (dto.newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.password) {
      throw new AppError('User has no password set', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', HttpStatus.UNAUTHORIZED);
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new AppError(
        'New password cannot be the same as current password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePasswordById(userId, hashedPassword);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.authProvider === 'GOOGLE' && dto.email !== undefined && dto.email !== user.email) {
      throw new AppError(
        'Email cannot be changed for Google authenticated accounts',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (trimmedName.length < 2) {
        throw new AppError('Name must be at least 2 characters long', HttpStatus.BAD_REQUEST);
      }
      if (trimmedName.length > 50) {
        throw new AppError('Name must not exceed 50 characters', HttpStatus.BAD_REQUEST);
      }
      dto.name = trimmedName;
    }

    if (dto.email !== undefined && dto.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new AppError('Invalid email format', HttpStatus.BAD_REQUEST);
      }

      const existingUserWithEmail = await this.userRepository.findByEmail(dto.email);
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new AppError(
          'This email is already registered with another account',
          HttpStatus.CONFLICT,
        );
      }
    }

    if (dto.phone !== undefined) {
      const cleanedPhone = dto.phone.replace(/\s+/g, '');

      if (cleanedPhone.length > 0) {
        const coreNumber = cleanedPhone.startsWith('+91') ? cleanedPhone.slice(3) : cleanedPhone;

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(coreNumber)) {
          throw new AppError('Phone number must contain exactly 10 digits', HttpStatus.BAD_REQUEST);
        }

        const existingUserWithPhone = await this.userRepository.findByPhone(cleanedPhone);
        if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
          throw new AppError(
            'This phone number is already registered with another account',
            HttpStatus.CONFLICT,
          );
        }

        dto.phone = cleanedPhone;
      } else {
        dto.phone = '';
      }
    }

    const updatedUser = await this.userRepository.updateProfile(userId, dto);
    if (!updatedUser) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    const safeUser = UserMapper.toSafeUser(updatedUser);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    };
  }
}
