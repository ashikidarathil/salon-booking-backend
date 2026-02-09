import redisClient from '../../../config/redis';
import { injectable } from 'tsyringe';
import { IOtpService } from './IOtpService';
import { AppError } from '../../../common/errors/appError';
import { MESSAGES } from '../../../common/constants/messages';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

@injectable()
export class RedisOtpService implements IOtpService {
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generate(key: string, ttlSeconds: number): Promise<string> {
    const otp = this.generateCode();
    await redisClient.set(key, otp, { EX: ttlSeconds });
    return otp;
  }

  async resend(key: string, ttlSeconds: number): Promise<string> {
    return this.generate(key, ttlSeconds);
  }

  async verify(key: string, otp: string): Promise<void> {
    const storedOtp = await redisClient.get(key);

    if (!storedOtp || storedOtp !== otp) {
      throw new AppError(MESSAGES.AUTH.OTP_INVALID, HttpStatus.BAD_REQUEST);
    }

    await redisClient.del(key);
  }
}
