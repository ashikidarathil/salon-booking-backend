import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createSessionToken } from '../../../common/utils/cookie.util';
import { env } from '../../../config/env';
import { MESSAGES } from '../../../common/constants/messages';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';

import type { IAuthService } from './IAuthService';

import type { SignupDto } from '../dto/auth/Signup.dto';
import type { LoginDto } from '../dto/auth/Login.dto';
import type { VerifyOtpDto } from '../dto/auth/VerifyOtp.dto';
import type { GoogleLoginDto } from '../dto/auth/GoogleLogin.dto';

import type { ForgotPasswordDto } from '../dto/password/ForgotPassword.dto';
import type { ResetPasswordDto } from '../dto/password/ResetPassword.dto';

import type { SendSmsOtpDto } from '../dto/sms/SendSmsOtp.dto';
import type { VerifySmsOtpDto } from '../dto/sms/VerifySmsOtp.dto';

import type { ApplyAsStylistDto } from '../dto/stylist/ApplyAsStylist.dto';
import type { ApplyAsStylistResponseDto } from '../dto/stylist/ApplyAsStylistResponse.dto';

import type { SignupResponseDto } from '../dto/auth/SignupResponse.dto';
import type { VerifyOtpResponseDto } from '../dto/auth/VerifyOtpResponse.dto';
import type { LoginResponseDto } from '../dto/auth/LoginResponse.dto';
import type { MeResponseDto } from '../dto/auth/MeResponse.dto';
import type { ForgotPasswordResponseDto } from '../dto/password/ForgotPasswordResponse.dto';
import type { ResetPasswordResponseDto } from '../dto/password/ResetPasswordResponse.dto';

import type { IUserRepository } from '../repository/IUserRepository';
import { IOtpService } from './IOtpService';
import { OAuth2Client } from 'google-auth-library';
import { ISmsService } from '../../../common/service/sms/ISmsService';
import { IEmailService } from '../../../common/service/email/IEmailService';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { UserMapper } from '../mapper/user.mapper';
import { otpKey, OTP_TTL } from '../constants/otp.constants';
import { otpEmailTemplate } from '../../../common/service/email/emailTemplates';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TOKENS.OtpService) private readonly _otpService: IOtpService,
    @inject(TOKENS.SmsService) private readonly _smsService: ISmsService,
    @inject(TOKENS.EmailService) private readonly _emailService: IEmailService,
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
  ) {}

  /**
   *
   * @param SignupDto
   * @returns SignupResponseDto
   */
  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const name = dto.name.trim();
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

    const hashed = await bcrypt.hash(dto.password, 10);
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
      const otp = await this._otpService.generate(otpKey.signupEmail(email), OTP_TTL.SIGNUP_EMAIL);
      const template = otpEmailTemplate(otp);

      await this._emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });

      return {
        message: MESSAGES.AUTH.SIGNUP_EMAIL_SUCCESS,
        userId: user.id.toString(),
      };
    }

    if (phone && !email) {
      const otp = await this._otpService.generate(otpKey.signupSms(phone), OTP_TTL.SIGNUP_SMS);

      await this._smsService.sendSms({
        to: phone,
        message: `Your OTP is ${otp}. Valid for 5 minutes.`,
      });
      return {
        message: MESSAGES.AUTH.SIGNUP_PHONE_SUCCESS,
        userId: user.id.toString(),
      };
    }

    throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
  }

  /**
   *
   * @param VerifyOtpDto
   * @returns VerifyOtpResponseDto
   */

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const email = dto.email.toLowerCase().trim();

    await this._otpService.verify(otpKey.signupEmail(email), dto.otp);

    const user = await this._userRepo.markEmailVerified(email);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.OTP_VERIFIED };
  }

  /**
   *
   * @param email
   * @returns
   */

  async resendEmailOtp(email: string): Promise<{ success: true }> {
    const normalized = email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(normalized);
    if (!user) throw new AppError(MESSAGES.AUTH.EMAIL_NOT_FOUND, HttpStatus.NOT_FOUND);

    await this._otpService.generate(otpKey.signupEmail(normalized), OTP_TTL.SIGNUP_EMAIL);
    return { success: true };
  }

  /**
   *
   * @param SendSmsOtpDto
   * @returns
   */

  async sendSmsOtp(dto: SendSmsOtpDto): Promise<{ message: string }> {
    const phone = dto.phone.trim();
    const otp = await this._otpService.generate(otpKey.signupSms(phone), OTP_TTL.SIGNUP_SMS);
    await this._smsService.sendSms({
      to: phone,
      message: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
    return { message: MESSAGES.AUTH.OTP_SENT_TO_MOBILE };
  }

  /**
   *
   * @param VerifySmsOtpDto
   * @returns
   */

  async verifySignupSmsOtp(dto: VerifySmsOtpDto): Promise<{ success: true }> {
    const phone = dto.phone.trim();

    await this._otpService.verify(otpKey.signupSms(phone), dto.otp);

    const user = await this._userRepo.markPhoneVerifiedByPhone(phone);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return { success: true as const };
  }

  /**
   *
   * @param phone
   * @returns
   */

  async resendSmsOtp(phone: string): Promise<{ success: true }> {
    const normalized = phone.trim();
    const user = await this._userRepo.findByPhone(normalized);
    if (!user) throw new AppError(MESSAGES.AUTH.PHONE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generate(otpKey.signupSms(normalized), OTP_TTL.SIGNUP_SMS);
    await this._smsService.sendSms({
      to: normalized,
      message: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
    return { success: true };
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

  /* ========================== LOGIN & SESSION ========================== */

  /**
   *
   * @param dto
   * @param tabId
   * @returns LoginResponseDto
   */
  async login(dto: LoginDto, tabId?: string): Promise<LoginResponseDto> {
    const identifier = dto.identifier.trim();
    const user = await this._userRepo.findByEmailOrPhone(identifier);

    if (!user) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (user.role !== dto.role) {
      throw new AppError(MESSAGES.AUTH.UNAUTHORIZED_ROLE_ACCESS, HttpStatus.FORBIDDEN);
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

    const token = createSessionToken(user.id, user.role, tabId);
    return {
      user: UserMapper.toSafeUser(user),
      token,
    };
  }

  /**
   *
   * @param GoogleLoginDto
   * @param tabId
   * @returns LoginResponseDto
   */

  async googleLogin(dto: GoogleLoginDto, tabId?: string): Promise<LoginResponseDto> {
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
      throw new AppError(MESSAGES.AUTH.GOOGLE_LOGIN_ONLY_FOR_USERS, HttpStatus.FORBIDDEN);
    }

    const token = createSessionToken(user.id, user.role, tabId);
    return {
      user: UserMapper.toSafeUser(user),
      token,
    };
  }

  /**
   *
   * @param refreshToken
   * @param tabId
   * @returns LoginResponseDto
   */
  async refresh(refreshToken: string, tabId?: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new AppError(MESSAGES.AUTH.NO_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
      userId: string;
      role: UserRole;
      tabId?: string;
    };

    const user = await this._userRepo.findById(decoded.userId);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    if (user.isBlocked) {
      throw new AppError(MESSAGES.AUTH.USER_BLOCKED, HttpStatus.FORBIDDEN);
    }

    const token = createSessionToken(user.id, user.role, tabId);
    return {
      user: UserMapper.toSafeUser(user),
      token,
    };
  }

  /**
   *
   * @param userId
   * @returns MeResponseDto
   */
  async me(userId: string): Promise<MeResponseDto> {
    const user = await this._userRepo.findById(userId);

    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (user.isBlocked) {
      throw new AppError(MESSAGES.AUTH.USER_BLOCKED, HttpStatus.FORBIDDEN);
    }

    if (!user.isActive) {
      throw new AppError(MESSAGES.AUTH.VERIFY_EMAIL_OR_PHONE, HttpStatus.FORBIDDEN);
    }

    return { user: UserMapper.toSafeUser(user) };
  }

  /* ========================== PASSWORD ========================== */

  /**
   *
   * @param ForgotPasswordDto
   * @returns ForgotPasswordResponseDto
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generate(
      otpKey.resetPassword(email),
      OTP_TTL.RESET_PASSWORD,
    );

    console.log(`Password reset token for ${email}: ${otp}`);
    const template = otpEmailTemplate(otp);

    await this._emailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return { message: MESSAGES.AUTH.RESET_TOKEN_SENT };
  }

  /**
   *
   * @param email
   * @returns
   */
  async resendResetOtp(email: string): Promise<{ success: true }> {
    const normalized = email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(normalized);
    if (!user) throw new AppError(MESSAGES.AUTH.EMAIL_NOT_FOUND, HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generate(
      otpKey.resetPassword(normalized),
      OTP_TTL.RESET_PASSWORD,
    );
    console.log(`Reset OTP for ${normalized}: ${otp}`);
    const template = otpEmailTemplate(otp);

    await this._emailService.sendEmail({
      to: normalized,
      subject: template.subject,
      html: template.html,
    });
    return { success: true };
  }

  /**
   *
   * @param email
   * @param otp
   * @returns
   */
  async verifyResetOtp(email: string, otp: string): Promise<{ success: true }> {
    const normalized = email.toLowerCase().trim();
    await this._otpService.verify(otpKey.resetPassword(normalized), otp);
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    const user = await this._userRepo.updatePassword(email, hashed);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.RESET_OK };
  }

  /* ========================== STYLIST ========================== */

  /**
   *
   * @param ApplyAsStylistDto
   * @returns ApplyAsStylistResponseDto
   */
  async applyAsStylist(dto: ApplyAsStylistDto): Promise<ApplyAsStylistResponseDto> {
    const { name, email, phone, specialization, experience } = dto;

    if (!email && !phone) {
      throw new AppError(MESSAGES.AUTH.EMAIL_OR_PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (!specialization?.trim()) {
      throw new AppError(MESSAGES.AUTH.SPECIALIZATION_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (!experience) {
      throw new AppError(MESSAGES.AUTH.EXPERIENCE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existing = await this._userRepo.findByEmail(normalizedEmail);

      if (existing) {
        throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.BAD_REQUEST);
      }
    }

    if (phone) {
      const normalizedPhone = phone.trim();

      const existing = await this._userRepo.findByPhone(normalizedPhone);

      if (existing) {
        throw new AppError(MESSAGES.AUTH.PHONE_EXISTS, HttpStatus.BAD_REQUEST);
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
      specialization: specialization.trim(),
      experience,
    });

    return {
      message: MESSAGES.AUTH.STYLIST_APPLICATION_SUCCESS,
      userId: user.id,
    };
  }

  async getUsers(query: PaginationQueryDto) {
    return this._userRepo.getPaginated(query);
  }
}
