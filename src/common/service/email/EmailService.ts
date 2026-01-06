import nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';
import { env } from '../../../config/env';
import { IEmailService } from './IEmailService';
import { otpEmailTemplate } from './emailTemplates';

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

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const template = otpEmailTemplate(otp);

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }
}
