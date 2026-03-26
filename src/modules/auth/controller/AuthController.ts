import type { Request, Response } from 'express';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';
import { MESSAGES } from '../../../common/constants/messages';
import { AppError } from '../../../common/errors/appError';
import type { IAuthController } from './IAuthController';
import type { IAuthService } from '../service/IAuthService';
import { setAuthCookies, clearAuthCookies } from '../../../common/utils/cookie.util';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IProfileService } from '../service/IProfileService';

import type {
  SignupDto,
  LoginDto,
  VerifyOtpDto,
  GoogleLoginDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  SendSmsOtpDto,
  VerifySignupSmsOtpDto,
  ApplyAsStylistDto,
} from '../dto/auth.schema';

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
    const dto: SignupDto = req.body;
    const data = await this._authService.signup(dto);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, MESSAGES.AUTH.SIGNUP_SUCCESS, data));
  }

  async verifyOtp(req: Request, res: Response) {
    const dto: VerifyOtpDto = req.body;
    const data = await this._authService.verifyOtp(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.AUTH.OTP_VERIFIED, data));
  }

  async sendSmsOtp(req: Request, res: Response) {
    const dto: SendSmsOtpDto = req.body;
    const data = await this._authService.sendSmsOtp(dto);
    res.json(new ApiResponse(true, MESSAGES.AUTH.SMS_OTP_SENT, data));
  }

  async verifySignupSmsOtp(req: Request, res: Response) {
    const dto: VerifySignupSmsOtpDto = req.body;
    await this._authService.verifySignupSmsOtp(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.AUTH.PHONE_VERIFIED));
  }

  async resendEmailOtp(req: Request, res: Response) {
    const { email } = req.body;
    await this._authService.resendEmailOtp(email);
    res.json(new ApiResponse(true, MESSAGES.AUTH.EMAIL_OTP_SENT));
  }

  async resendSmsOtp(req: Request, res: Response) {
    const { phone } = req.body;
    await this._authService.resendSmsOtp(phone);
    res.json(new ApiResponse(true, MESSAGES.AUTH.SMS_OTP_RESENT));
  }

  async login(req: Request, res: Response) {
    const dto: LoginDto = req.body;
    const tabId = this.getTabId(req);
    const data = await this._authService.login(dto, tabId);
    setAuthCookies(res, data.user.role, data.tokens);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.LOGIN_SUCCESS, { user: data.user }));
  }

  async googleLogin(req: Request, res: Response) {
    const dto: GoogleLoginDto = req.body;
    const tabId = this.getTabId(req);

    const data = await this._authService.googleLogin(dto, tabId);
    setAuthCookies(res, data.user.role, data.tokens);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.GOOGLE_LOGIN_SUCCESS, { user: data.user }));
  }

  async forgotPassword(req: Request, res: Response) {
    const dto: ForgotPasswordDto = req.body;
    const data = await this._authService.forgotPassword(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.AUTH.RESET_OTP_SENT, data));
  }

  async resendResetOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    await this._authService.resendResetOtp(email.trim().toLowerCase());

    res.json(new ApiResponse(true, MESSAGES.AUTH.RESET_OTP_RESENT));
  }

  async verifyResetOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    await this._authService.verifyResetOtp(email.trim().toLowerCase(), otp);

    res.json(new ApiResponse(true, MESSAGES.AUTH.RESET_OTP_VERIFIED));
  }

  async resetPassword(req: Request, res: Response) {
    const dto: ResetPasswordDto = req.body;
    const data = await this._authService.resetPassword(dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.AUTH.RESET_OK, data));
  }

  async refresh(req: Request, res: Response) {
    const roleHeader = (req.headers['x-auth-role'] as string)?.toUpperCase();
    const token = req.cookies?.[`${roleHeader?.toLowerCase()}_refresh_token`];
    const tabId = this.getTabId(req);
    const data = await this._authService.refresh(token, tabId);
    setAuthCookies(res, data.user.role, data.tokens);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.TOKEN_REFRESHED, { user: data.user }));
  }

  async me(req: Request & { auth?: { userId: string } }, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }
    const data = await this._authService.me(req.auth.userId);

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.AUTH.ME_SUCCESS, data));
  }

  async logout(req: Request, res: Response) {
    const roleHeader = (req.headers['x-auth-role'] as string)?.toUpperCase();
    clearAuthCookies(res, roleHeader as UserRole);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.LOGOUT_SUCCESS || 'Logged out'));
  }

  async applyAsStylist(req: Request, res: Response): Promise<void> {
    const dto: ApplyAsStylistDto = req.body;
    const data = await this._authService.applyAsStylist(dto);

    res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, MESSAGES.AUTH.STYLIST_APPLICATION_SUBMITTED, data));
  }

  async uploadProfilePicture(req: Request & { auth?: { userId: string } }, res: Response) {
    const data = await this.handleProfileUpload(req);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.PROFILE_PICTURE_UPLOAD_SUCCESS, data));
  }

  async updateProfilePicture(req: Request & { auth?: { userId: string } }, res: Response) {
    const data = await this.handleProfileUpload(req);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.AUTH.PROFILE_PICTURE_UPDATE_SUCCESS, data));
  }

  async changePassword(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const data = await this._profileService.changePassword(userId, req.body);

    res.status(HttpStatus.OK).json(new ApiResponse(true, data.message, data));
  }

  async updateProfile(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.AUTH.AUTH_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const data = await this._profileService.updateProfile(userId, req.body);

    res.status(HttpStatus.OK).json(new ApiResponse(true, data.message, data));
  }
}
