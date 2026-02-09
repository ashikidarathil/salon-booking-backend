import type { SignupDto } from '../dto/auth/Signup.dto';
import type { LoginDto } from '../dto/auth/Login.dto';
import type { VerifyOtpDto } from '../dto/auth/VerifyOtp.dto';
import type { GoogleLoginDto } from '../dto/auth/GoogleLogin.dto';

import type { ResetPasswordDto } from '../dto/password/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/password/ForgotPassword.dto';

import type { SendSmsOtpDto } from '../dto/sms/SendSmsOtp.dto';
import type { VerifySmsOtpDto } from '../dto/sms/VerifySmsOtp.dto';

import type { UserEntity } from '../../../common/types/userEntity';
import type { ApplyAsStylistDto } from '../dto/stylist/ApplyAsStylist.dto';
import type { ApplyAsStylistResponseDto } from '../dto/stylist/ApplyAsStylistResponse.dto';

import type { SignupResponseDto } from '../dto/auth/SignupResponse.dto';
import type { LoginResponseDto } from '../dto/auth/LoginResponse.dto';
import type { VerifyOtpResponseDto } from '../dto/auth/VerifyOtpResponse.dto';
import type { MeResponseDto } from '../dto/auth/MeResponse.dto';
import type { ForgotPasswordResponseDto } from '../dto/password/ForgotPasswordResponse.dto';
import type { ResetPasswordResponseDto } from '../dto/password/ResetPasswordResponse.dto';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: UserEntity;
  tokens: TokenPair;
};

export interface IAuthService {
  signup(dto: SignupDto): Promise<SignupResponseDto>;
  verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto>;

  resendEmailOtp(email: string): Promise<{ success: true }>;
  resendSmsOtp(phone: string): Promise<{ success: true }>;

  sendSmsOtp(dto: SendSmsOtpDto): Promise<{ message: string }>;
  verifySignupSmsOtp(dto: VerifySmsOtpDto): Promise<{ success: true }>;

  login(dto: LoginDto, tabId?: string): Promise<LoginResponseDto>;
  googleLogin(dto: GoogleLoginDto, tabId?: string): Promise<LoginResponseDto>;
  refresh(refreshToken: string, tabId?: string): Promise<LoginResponseDto>;
  me(userId: string): Promise<MeResponseDto>;

  forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto>;
  resendResetOtp(email: string): Promise<{ success: true }>;
  verifyResetOtp(email: string, otp: string): Promise<{ success: true }>;
  resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto>;

  // verifySmsOtp(userId: string, dto: VerifySmsOtpDto): Promise<{ success: boolean }>;

  applyAsStylist(dto: ApplyAsStylistDto): Promise<ApplyAsStylistResponseDto>;
}
