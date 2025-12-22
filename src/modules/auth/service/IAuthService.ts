import type { SignupDto } from '../dto/Signup.dto';
import type { LoginDto } from '../dto/Login.dto';
import type { VerifyOtpDto } from '../dto/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/ResetPassword.dto';
import { LoginResponseDto } from '../dto/LoginResponse.dto';
import type { ForgotPasswordDto } from '../dto/ForgotPassword.dto';

export interface IAuthService {
  signup(dto: SignupDto): Promise<{ message: string; userId: string }>;
  verifyOtp(dto: VerifyOtpDto): Promise<{ success: true; message: string }>;
  login(dto: LoginDto): Promise<LoginResponseDto>;
  forgotPassword(email: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ success: true; message: string }>;
}
