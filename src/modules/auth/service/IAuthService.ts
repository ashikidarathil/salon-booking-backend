import type { SignupDto } from '../dto/auth/Signup.dto';
import type { LoginDto } from '../dto/auth/Login.dto';
import type { VerifyOtpDto } from '../dto/auth/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/password/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/password/ForgotPassword.dto';
import type { GoogleLoginDto } from '../dto/auth/GoogleLogin.dto';
import type { UserEntity } from '../../../types/userEntity';
import type { SendSmsOtpDto } from '../dto/sms/SendSmsOtp.dto';
import type { VerifySmsOtpDto } from '../dto/sms/VerifySmsOtp.dto';
import type { ApplyAsStylistDto } from '../dto/stylist/ApplyAsStylist.dto';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: UserEntity;
  tokens: TokenPair;
};

export interface IAuthService {
  signup(dto: SignupDto): Promise<{ message: string; userId: string }>;
  verifyOtp(dto: VerifyOtpDto): Promise<{ success: true; message: string }>;

  login(dto: LoginDto, tabId?: string): Promise<AuthResult>;
  googleLogin(dto: GoogleLoginDto, tabId?: string): Promise<AuthResult>;

  refresh(refreshToken: string, tabId?: string): Promise<AuthResult>;
  me(userId: string): Promise<UserEntity>;

  forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ success: true; message: string }>;

  sendSmsOtp(dto: SendSmsOtpDto): Promise<{ message: string }>;
  // verifySmsOtp(userId: string, dto: VerifySmsOtpDto): Promise<{ success: boolean }>;
  verifySignupSmsOtp(dto: VerifySmsOtpDto): Promise<{ success: boolean }>;
  applyAsStylist(dto: ApplyAsStylistDto): Promise<{
    message: string;
    userId: string;
  }>;

  resendEmailOtp(email: string): Promise<{ success: boolean }>;
  resendSmsOtp(email: string): Promise<{ success: boolean }>;

  resendResetOtp(email: string): Promise<{ success: boolean }>;
  verifyResetOtp(email: string, otp: string): Promise<{ success: boolean }>;
}
