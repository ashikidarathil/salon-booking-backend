export interface ISmsService {
  sendOtp(phone: string, otp: string): Promise<void>;
}
