export interface IEmailService {
  sendOtpEmail(to: string, otp: string): Promise<void>;
  send(to: string, subject: string, html: string): Promise<void>;
}
