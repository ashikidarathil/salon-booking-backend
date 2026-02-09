export interface IEmailService {
  sendEmail(params: { to: string; subject: string; html: string }): Promise<void>;
}
