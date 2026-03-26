import { injectable, inject } from 'tsyringe';
import bcrypt from 'bcrypt';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';

import type { IProfileService } from './IProfileService';
import type { UploadProfilePictureDto } from '../dto/profile/UploadProfilePicture.dto';
import type { UploadProfilePictureResponseDto } from '../dto/profile/UploadProfilePictureResponse.dto';
import type { ChangePasswordResponseDto } from '../dto/profile/ChangePassword.response';
import type { UpdateProfileResponseDto } from '../dto/profile/UpdateProfile.response';

import type { IImageService } from '../../../common/service/image/IImageService';
import type { IUserRepository } from '../repository/IUserRepository';
import { UserMapper } from '../mapper/user.mapper';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { UserRole } from '../../../common/enums/userRole.enum';
import type { ChangePasswordDto, UpdateProfileDto } from '../dto/auth.schema';

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TOKENS.ImageService)
    private readonly imageService: IImageService,

    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.StylistRepository)
    private readonly stylistRepository: IStylistRepository,
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

    // Business logic check (not just validation)
    if (user.authProvider === 'GOOGLE' && dto.email !== undefined && dto.email !== user.email) {
      throw new AppError(
        'Email cannot be changed for Google authenticated accounts',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.email !== undefined && dto.email.trim().length > 0) {
      const existingUserWithEmail = await this.userRepository.findByEmail(dto.email);
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new AppError(
          'This email is already registered with another account',
          HttpStatus.CONFLICT,
        );
      }
    }

    if (dto.phone !== undefined && dto.phone.trim().length > 0) {
      const existingUserWithPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
        throw new AppError(
          'This phone number is already registered with another account',
          HttpStatus.CONFLICT,
        );
      }
    }

    if (user.role === UserRole.STYLIST && dto.bio !== undefined) {
      await this.stylistRepository.updateByUserId(userId, { bio: dto.bio });
    }

    const updatedUser = await this.userRepository.updateProfile(userId, dto);
    if (!updatedUser) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    const safeUser = UserMapper.toSafeUser(updatedUser);

    if (user.role === UserRole.STYLIST) {
      const stylist = await this.stylistRepository.findByUserId(userId);
      if (stylist) {
        safeUser.bio = stylist.bio;
      }
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    };
  }
}
