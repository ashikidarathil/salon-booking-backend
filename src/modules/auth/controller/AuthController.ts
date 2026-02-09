import type { Request, Response } from 'express';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';
import { AppError } from '../../../common/errors/appError';
import type { IAuthController } from './IAuthController';
import type { IAuthService } from '../service/IAuthService';
import { setAuthCookie, clearAuthCookies } from '../../../common/utils/cookie.util';
import type { SignupDto } from '../dto/auth/Signup.dto';
import type { LoginDto } from '../dto/auth/Login.dto';
import type { VerifyOtpDto } from '../dto/auth/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/password/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/password/ForgotPassword.dto';
import type { SendSmsOtpDto } from '../dto/sms/SendSmsOtp.dto';
import type { VerifySmsOtpDto } from '../dto/sms/VerifySmsOtp.dto';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApplyAsStylistDto } from '../dto/stylist/ApplyAsStylist.dto';
import { IProfileService } from '../service/IProfileService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(TOKENS.AuthService) private readonly _authService: IAuthService,
    @inject(TOKENS.ProfileService) private readonly _profileService: IProfileService,
  ) {}

  private getTabId(req: Request): string {
    return (req.headers['x-tab-id'] as string) || '';
  }

  private async handleProfileUpload(req: Request & { auth?: { userId: string } }) {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    return this._profileService.uploadProfilePicture({
      userId,
      file: req.file as Express.Multer.File,
    });
  }

  async signup(req: Request, res: Response) {
    const dto: SignupDto = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };
    const data = await this._authService.signup(dto);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, 'Signup successful', data));
  }

  async verifyOtp(req: Request, res: Response) {
    const dto: VerifyOtpDto = {
      email: req.body.email,
      otp: req.body.otp,
    };
    const data = await this._authService.verifyOtp(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'OTP verified', data));
  }

  async sendSmsOtp(req: Request, res: Response) {
    const dto: SendSmsOtpDto = {
      phone: req.body.phone,
    };
    const data = await this._authService.sendSmsOtp(dto);
    res.json(new ApiResponse(true, 'SMS OTP sent', data));
  }

  async verifySignupSmsOtp(req: Request, res: Response) {
    const dto: VerifySmsOtpDto = {
      phone: req.body.phone,
      otp: req.body.otp,
    };
    await this._authService.verifySignupSmsOtp(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Phone verified'));
  }

  async resendEmailOtp(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) throw new AppError('Email required', HttpStatus.BAD_REQUEST);

    await this._authService.resendEmailOtp(email);
    res.json(new ApiResponse(true, 'New OTP sent to email'));
  }

  async resendSmsOtp(req: Request, res: Response) {
    const { phone } = req.body;
    if (!phone) throw new AppError('Phone required', HttpStatus.BAD_REQUEST);

    await this._authService.resendSmsOtp(phone);
    res.json(new ApiResponse(true, 'New OTP sent to phone'));
  }

  /*
  async verifySmsOtp(req: Request & { auth?: { userId: string } }, res: Response) {
    const dto: VerifySmsOtpDto = {
      phone: req.body.phone,
      otp: req.body.otp,
    };

    const userId = req.auth!.userId;
    await this._authService.verifySmsOtp(userId, dto);
    res.json(new ApiResponse(true, 'Mobile verified'));
  }
  */

  async login(req: Request, res: Response) {
    const dto: LoginDto = {
      identifier: req.body.identifier,
      password: req.body.password,
      role: req.body.role,
    };
    const tabId = this.getTabId(req);
    const data = await this._authService.login(dto, tabId);
    setAuthCookie(res, data.token);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Login successful', { user: data.user }));
  }

  async googleLogin(req: Request, res: Response) {
    const dto = { idToken: req.body.idToken };
    const tabId = this.getTabId(req);

    const data = await this._authService.googleLogin(dto, tabId);
    setAuthCookie(res, data.token);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Google login successful', { user: data.user }));
  }

  async forgotPassword(req: Request, res: Response) {
    const dto: ForgotPasswordDto = {
      email: req.body.email,
    };
    const data = await this._authService.forgotPassword(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Reset OTP sent', data));
  }

  async resendResetOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: MESSAGES.AUTH.EMAIL_REQUIRED,
      });
      return;
    }

    await this._authService.resendResetOtp(email.trim().toLowerCase());

    res.json(new ApiResponse(true, 'Reset OTP sent to your email'));
  }

  async verifyResetOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: MESSAGES.AUTH.EMAIL_AND_OTP_REQUIRED,
      });
      return;
    }

    await this._authService.verifyResetOtp(email.trim().toLowerCase(), otp);

    res.json(new ApiResponse(true, 'Reset OTP verified'));
  }

  async resetPassword(req: Request, res: Response) {
    const dto: ResetPasswordDto = {
      email: req.body.email,
      otp: req.body.otp,
      newPassword: req.body.newPassword,
    };
    const data = await this._authService.resetPassword(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Password reset successful', data));
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    const tabId = this.getTabId(req);
    const data = await this._authService.refresh(token, tabId);
    setAuthCookie(res, data.token);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Token refreshed', { user: data.user }));
  }

  async me(req: Request & { auth?: { userId: string } }, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }
    const data = await this._authService.me(req.auth.userId);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Me', data));
  }

  async logout(req: Request, res: Response) {
    clearAuthCookies(res);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Logged out'));
  }

  async applyAsStylist(req: Request, res: Response): Promise<void> {
    const dto: ApplyAsStylistDto = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      specialization: req.body.specialization,
      experience: Number(req.body.experience),
    };

    const data = await this._authService.applyAsStylist(dto);

    res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, 'Stylist application submitted', data));
  }

  async uploadProfilePicture(req: Request & { auth?: { userId: string } }, res: Response) {
    const data = await this.handleProfileUpload(req);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Profile picture uploaded successfully', data));
  }

  async updateProfilePicture(req: Request & { auth?: { userId: string } }, res: Response) {
    const data = await this.handleProfileUpload(req);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Profile picture updated successfully', data));
  }

  async changePassword(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const dto = {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    };

    const data = await this._profileService.changePassword(userId, dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, data.message, data));
  }

  async updateProfile(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const dto = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const data = await this._profileService.updateProfile(userId, dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, data.message, data));
  }
}
