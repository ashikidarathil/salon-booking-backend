import redisClient from '../../../config/redis';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';
import { IOtpService } from './IOtpService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IEmailService } from '../../../common/service/email/IEmailService';

@injectable()
export class RedisOtpService implements IOtpService {
  constructor(
    @inject(TOKENS.EmailService)
    private readonly _emailService: IEmailService,
  ) {}
  async generateSignupOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`signup:otp:${email}`, otp, { EX: 300 });

    await this._emailService.sendOtpEmail(email, otp);
    return otp;
  }

  async verifySignupOtp(email: string, otp: string): Promise<boolean> {
    const stored = await redisClient.get(`signup:otp:${email}`);
    if (!stored || stored !== otp) {
      throw new AppError(MESSAGES.AUTH.OTP_INVALID, HttpStatus.BAD_REQUEST);
    }
    await redisClient.del(`signup:otp:${email}`);
    return true;
  }

  async generateResetOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`reset:otp:${email}`, otp, { EX: 600 });
    await this._emailService.sendOtpEmail(email, otp);
    return otp;
  }

  async verifyResetOtp(email: string, otp: string): Promise<boolean> {
    const stored = await redisClient.get(`reset:otp:${email}`);
    if (!stored || stored !== otp) {
      throw new AppError(MESSAGES.AUTH.RESET_OTP_INVALID, HttpStatus.BAD_REQUEST);
    }
    await redisClient.del(`reset:otp:${email}`);
    return true;
  }

  async generateSmsOtp(phone: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`sms:otp:${phone}`, otp, { EX: 300 });
    return otp;
  }

  async verifySmsOtp(phone: string, otp: string): Promise<boolean> {
    const stored = await redisClient.get(`sms:otp:${phone}`);
    if (!stored || stored !== otp) {
      throw new AppError('Invalid SMS OTP', HttpStatus.BAD_REQUEST);
    }
    await redisClient.del(`sms:otp:${phone}`);
    return true;
  }
}
