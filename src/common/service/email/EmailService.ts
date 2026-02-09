import nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';
import { env } from '../../../config/env';
import { IEmailService } from './IEmailService';

@injectable()
export class EmailService implements IEmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
