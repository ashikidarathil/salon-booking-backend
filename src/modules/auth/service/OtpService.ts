import redisClient from '../../../config/redis';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../../../common/constants/messages';
import { IOtpService } from './IOtpService';
import { injectable } from 'tsyringe';

@injectable()
export class RedisOtpService implements IOtpService {
  async generateSignupOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`signup:otp:${email}`, otp, { EX: 300 });
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
}
