import { injectable } from 'tsyringe';
import twilio from 'twilio';
import { env } from '../../../config/env';
import { ISmsService } from './ISmsService';

@injectable()
export class TwilioSmsService implements ISmsService {
  private client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  async sendSms(params: { to: string; message: string }): Promise<void> {
    await this.client.messages.create({
      body: params.message,
      from: env.TWILIO_PHONE_NUMBER,
      to: params.to,
    });
  }
}
