import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createAuthTokens } from '../../../common/utils/cookie.util';
import { env } from '../../../config/env';
import { MESSAGES } from '../../../common/constants/messages';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';

import type { IAuthService, AuthResult } from './IAuthService';
import type { SignupDto } from '../dto/auth/Signup.dto';
import type { LoginDto } from '../dto/auth/Login.dto';
import type { VerifyOtpDto } from '../dto/auth/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/password/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/password/ForgotPassword.dto';
import type { SendSmsOtpDto } from '../dto/sms/SendSmsOtp.dto';
import type { VerifySmsOtpDto } from '../dto/sms/VerifySmsOtp.dto';

import type { IUserRepository } from '../repository/IUserRepository';
import { IOtpService } from './IOtpService';
import { OAuth2Client } from 'google-auth-library';
import type { GoogleLoginDto } from '../dto/auth/GoogleLogin.dto';
import { ISmsService } from '../../../common/service/sms/ISmsService';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { ApplyAsStylistDto } from '../dto/stylist/ApplyAsStylist.dto';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TOKENS.OtpService) private readonly _otpService: IOtpService,
    @inject(TOKENS.SmsService) private readonly _smsService: ISmsService,
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
  ) {}

  async signup(dto: SignupDto) {
    const name = dto.name.trim();
    const password = dto.password;

    const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
    const phone = dto.phone ? dto.phone.trim() : undefined;

    if (!email && !phone) {
      throw new AppError(MESSAGES.AUTH.EMAIL_OR_PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (email) {
      const existingEmail = await this._userRepo.findByEmail(email);
      if (existingEmail) throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.BAD_REQUEST);
    }

    if (phone) {
      const existingPhone = await this._userRepo.findByPhone(phone);
      if (existingPhone) throw new AppError(MESSAGES.AUTH.PHONE_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this._userRepo.createUser({
      name,
      email,
      phone,
      password: hashed,
      role: UserRole.USER,
      isActive: false,
      status: 'ACTIVE',
      emailVerified: false,
      phoneVerified: false,
    });

    if (email && !phone) {
      await this._otpService.generateSignupOtp(email);
      return {
        message: 'Signup successful. Verify email OTP.',
        userId: user.id.toString(),
      };
    }

    if (phone && !email) {
      const otp = await this._otpService.generateSmsOtp(phone);
      await this._smsService.sendOtp(phone, otp);
      return {
        message: 'Signup successful. Verify phone OTP.',
        userId: user.id.toString(),
      };
    }

    throw new AppError('Invalid signup data', HttpStatus.BAD_REQUEST);
  }

  async sendSmsOtp(dto: SendSmsOtpDto) {
    const phone = dto.phone.trim();
    const otp = await this._otpService.generateSmsOtp(phone);
    await this._smsService.sendOtp(phone, otp);
    return { message: 'OTP sent to mobile' };
  }

  /*
  async verifySmsOtp(userId: string, dto: VerifySmsOtpDto) {
    const phone = dto.phone.trim();
    const otp = dto.otp;

    await this._otpService.verifySmsOtp(phone, otp);

    const existing = await this._userRepo.findByPhone(phone);

    if (existing && existing.id !== userId) {
      throw new AppError('Phone number already in use', HttpStatus.BAD_REQUEST);
    }

    const updated = await this._userRepo.markPhoneVerified(userId, phone);
    if (!updated) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return { success: true as const };
  }
  */

  async verifySignupSmsOtp(dto: VerifySmsOtpDto) {
    const phone = dto.phone.trim();

    await this._otpService.verifySmsOtp(phone, dto.otp);

    const user = await this._userRepo.markPhoneVerifiedByPhone(phone);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return { success: true as const };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();

    await this._otpService.verifySignupOtp(email, dto.otp);

    const user = await this._userRepo.markEmailVerified(email);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.OTP_OK };
  }

  async resendEmailOtp(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(normalized);
    if (!user) throw new AppError('Email not found', HttpStatus.NOT_FOUND);

    await this._otpService.generateSignupOtp(normalized);
    return { success: true };
  }

  async resendSmsOtp(phone: string) {
    const normalized = phone.trim();
    const user = await this._userRepo.findByPhone(normalized);
    if (!user) throw new AppError('Phone not found', HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generateSmsOtp(normalized);
    await this._smsService.sendOtp(normalized, otp);
    return { success: true };
  }

  async login(dto: LoginDto, tabId?: string): Promise<AuthResult> {
    const identifier = dto.identifier.trim();
    const user = await this._userRepo.findByEmailOrPhone(identifier);

    if (!user) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (user.role !== dto.role) {
      throw new AppError(MESSAGES.AUTH.UNAUTHORIZERD_ROLE_ACCESS, HttpStatus.FORBIDDEN);
    }
    if (!user.password)
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);

    if (user.authProvider === 'GOOGLE') {
      throw new AppError(MESSAGES.AUTH.USE_GOOGLE_LOGIN, HttpStatus.BAD_REQUEST);
    }
    if (user.isBlocked) {
      throw new AppError(MESSAGES.AUTH.USER_BLOCKED, HttpStatus.FORBIDDEN);
    }

    if (!user.isActive) {
      throw new AppError(MESSAGES.AUTH.VERIFY_EMAIL_OR_PHONE, HttpStatus.FORBIDDEN);
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);

    const tokens = createAuthTokens(user.id, user.role, tabId);
    return { user, tokens };
  }

  async googleLogin(dto: GoogleLoginDto, tabId?: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new AppError(MESSAGES.AUTH.INVALID_GOOGLE_TOKEN, HttpStatus.UNAUTHORIZED);
    }
    const email = payload.email.toLowerCase().trim();

    let user = await this._userRepo.findByEmail(email);

    if (user?.isBlocked) {
      throw new AppError(MESSAGES.AUTH.USER_BLOCKED, HttpStatus.FORBIDDEN);
    }

    if (!user) {
      user = await this._userRepo.createGoogleUser({
        name: payload.name || 'Google User',
        email,
        googleId: payload.sub,
      });
    }

    if (user?.role !== UserRole.USER) {
      throw new AppError(MESSAGES.AUTH.GOOGE_LOGIN_ONLY_FOR_USERS, HttpStatus.FORBIDDEN);
    }

    const tokens = createAuthTokens(user.id, user.role, tabId);
    return { user, tokens };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const e = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(e);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generateResetOtp(e);
    console.log(`Password reset token for ${e}: ${otp}`);

    return { message: MESSAGES.AUTH.RESET_TOKEN_SENT };
  }

  async resendResetOtp(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(normalized);
    if (!user) throw new AppError('Email not found', HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generateResetOtp(normalized);
    console.log(`Reset OTP for ${normalized}: ${otp}`);
    return { success: true };
  }

  async verifyResetOtp(email: string, otp: string) {
    const normalized = email.toLowerCase().trim();
    await this._otpService.verifyResetOtp(normalized, otp);
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    const user = await this._userRepo.updatePassword(email, hashed);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.RESET_OK };
  }

  async applyAsStylist(dto: ApplyAsStylistDto) {
    const { name, email, phone, specialization, experience } = dto;

    if (!email && !phone) {
      throw new AppError('Email or phone is required', HttpStatus.BAD_REQUEST);
    }

    if (!specialization?.trim()) {
      throw new AppError('Specialization is required', HttpStatus.BAD_REQUEST);
    }

    if (!experience) {
      throw new AppError('Experience is required', HttpStatus.BAD_REQUEST);
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existing = await this._userRepo.findByEmail(normalizedEmail);

      if (existing) {
        throw new AppError('Email already registered', HttpStatus.BAD_REQUEST);
      }
    }

    if (phone) {
      const normalizedPhone = phone.trim();

      const existing = await this._userRepo.findByPhone(normalizedPhone);

      if (existing) {
        throw new AppError('Phone already registered', HttpStatus.BAD_REQUEST);
      }
    }

    const user = await this._userRepo.createUser({
      name: name?.trim() || email?.split('@')[0] || 'Stylist',
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      role: UserRole.STYLIST,
      isActive: false,
      status: 'APPLIED',
      emailVerified: false,
      phoneVerified: false,
    });

    await this._stylistRepo.createStylistDraft({
      userId: user.id,
      branchId: undefined,
      specialization: specialization.trim(),
      experience,
    });

    return {
      message: 'Application submitted successfully. Admin will review and send invitation.',
      userId: user.id,
    };
  }

  async refresh(refreshToken: string, tabId?: string): Promise<AuthResult> {
    if (!refreshToken) {
      throw new AppError('No refresh token', HttpStatus.UNAUTHORIZED);
    }

    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
      userId: string;
      role: UserRole;
      tabId?: string;
    };

    const user = await this._userRepo.findById(decoded.userId);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const tokens = createAuthTokens(user.id, user.role, tabId);
    return { user, tokens };
  }

  async me(userId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    return user;
  }
}
