export interface IOtpService {
  generate(key: string, ttlSeconds: number): Promise<string>;
  resend(key: string, ttlSeconds: number): Promise<string>;
  verify(key: string, otp: string): Promise<void>;
}
