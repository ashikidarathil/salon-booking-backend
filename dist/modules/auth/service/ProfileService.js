"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const tsyringe_1 = require("tsyringe");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const messages_1 = require("../../../common/constants/messages");
const user_mapper_1 = require("../mapper/user.mapper");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
let ProfileService = class ProfileService {
    constructor(imageService, userRepository, stylistRepository) {
        this.imageService = imageService;
        this.userRepository = userRepository;
        this.stylistRepository = stylistRepository;
    }
    async uploadProfilePicture(dto) {
        const { userId, file } = dto;
        if (!file) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.NO_FILE_UPLOADED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
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
    async changePassword(userId, dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new appError_1.AppError('New password and confirm password do not match', httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const user = await this.userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new appError_1.AppError('User not found', httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (!user.password) {
            throw new appError_1.AppError('User has no password set', httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const isPasswordValid = await bcrypt_1.default.compare(dto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new appError_1.AppError('Current password is incorrect', httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const isSamePassword = await bcrypt_1.default.compare(dto.newPassword, user.password);
        if (isSamePassword) {
            throw new appError_1.AppError('New password cannot be the same as current password', httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const hashedPassword = await bcrypt_1.default.hash(dto.newPassword, 10);
        await this.userRepository.updatePasswordById(userId, hashedPassword);
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new appError_1.AppError('User not found', httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        // Business logic check (not just validation)
        if (user.authProvider === 'GOOGLE' && dto.email !== undefined && dto.email !== user.email) {
            throw new appError_1.AppError('Email cannot be changed for Google authenticated accounts', httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (dto.email !== undefined && dto.email.trim().length > 0) {
            const existingUserWithEmail = await this.userRepository.findByEmail(dto.email);
            if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
                throw new appError_1.AppError('This email is already registered with another account', httpStatus_enum_1.HttpStatus.CONFLICT);
            }
        }
        if (dto.phone !== undefined && dto.phone.trim().length > 0) {
            const existingUserWithPhone = await this.userRepository.findByPhone(dto.phone);
            if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
                throw new appError_1.AppError('This phone number is already registered with another account', httpStatus_enum_1.HttpStatus.CONFLICT);
            }
        }
        if (user.role === userRole_enum_1.UserRole.STYLIST && dto.bio !== undefined) {
            await this.stylistRepository.updateByUserId(userId, { bio: dto.bio });
        }
        const updatedUser = await this.userRepository.updateProfile(userId, dto);
        if (!updatedUser) {
            throw new appError_1.AppError('User not found', httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const safeUser = user_mapper_1.UserMapper.toSafeUser(updatedUser);
        if (user.role === userRole_enum_1.UserRole.STYLIST) {
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
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ImageService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ProfileService);
