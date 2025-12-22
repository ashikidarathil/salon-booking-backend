export interface IOtpService {
  generateSignupOtp(email: string): Promise<string>;
  verifySignupOtp(email: string, otp: string): Promise<boolean>;

  generateResetOtp(email: string): Promise<string>;
  verifyResetOtp(email: string, otp: string): Promise<boolean>;
}
