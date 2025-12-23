import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { MESSAGES } from '../../../common/constants/messages';
import { AppError } from '../../../common/errors/AppError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';

import type { IAuthService } from './IAuthService';
import type { SignupDto } from '../dto/Signup.dto';
import type { LoginDto } from '../dto/Login.dto';
import type { VerifyOtpDto } from '../dto/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/ForgotPassword.dto';

import type { IUserRepository } from '../repository/IUserRepository';
import { AuthMapper } from './mapper/AuthMapper';
import { IOtpService } from './IOtpService';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TOKENS.OtpService) private readonly _otpService: IOtpService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this._userRepo.findByEmail(email);
    if (existing) throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.BAD_REQUEST);

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this._userRepo.createUser({
      name: dto.name.trim(),
      email,
      phone: dto.phone,
      password: hashed,
      role: UserRole.USER,
      isActive: false,
    });

    const otp = await this._otpService.generateSignupOtp(email);
    console.log(`OTP for ${email}: ${otp}`);

    return { message: MESSAGES.AUTH.SIGNUP_OK_VERIFY_OTP, userId: user.id.toString() };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    await this._otpService.verifySignupOtp(email, dto.otp);

    const user = await this._userRepo.activateUser(email);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.OTP_OK };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (!user.password) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const ok = await bcrypt.compare(dto.password, user.password);

    if (!ok) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);

    const token = jwt.sign({ userId: user.id.toString(), role: user.role }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return AuthMapper.toLoginResponse(user, token);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const e = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findByEmail(e);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const otp = await this._otpService.generateResetOtp(e);
    console.log(`Password reset token for ${e}: ${otp}`);

    return { message: MESSAGES.AUTH.RESET_TOKEN_SENT };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    await this._otpService.verifyResetOtp(email, dto.otp);

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    const user = await this._userRepo.updatePassword(email, hashed);
    if (!user) throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    return { success: true as const, message: MESSAGES.AUTH.RESET_OK };
  }
}
