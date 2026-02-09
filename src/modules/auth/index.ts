import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import type { IUserRepository } from './repository/IUserRepository';
import { UserRepository } from './repository/UserRepository';

import type { IOtpService } from './service/IOtpService';
import { RedisOtpService } from './service/OtpService';
import { EmailService } from '../../common/service/email/EmailService';
import type { IEmailService } from '../../common/service/email/IEmailService';

import type { IAuthService } from './service/IAuthService';
import { AuthService } from './service/AuthService';

import { AuthController } from './controller/AuthController';

import { TwilioSmsService } from '../../common/service/sms/TwilioSmsService';
import type { ISmsService } from '../../common/service/sms/ISmsService';

import { StylistRepository } from '../stylistInvite/repository/StylistRepository';
import type { IStylistRepository } from '../stylistInvite/repository/IStylistRepository';

import type { IImageService } from '../../common/service/image/IImageService';
import { S3Service } from '../../common/service/image/S3Service';

import { ProfileService } from './service/ProfileService';
import { IProfileService } from './service/IProfileService';

container.register<IUserRepository>(TOKENS.UserRepository, { useClass: UserRepository });
container.register<IOtpService>(TOKENS.OtpService, { useClass: RedisOtpService });
container.register<IAuthService>(TOKENS.AuthService, { useClass: AuthService });
container.register<IEmailService>(TOKENS.EmailService, {
  useClass: EmailService,
});
container.register<ISmsService>(TOKENS.SmsService, {
  useClass: TwilioSmsService,
});
container.register<IStylistRepository>(TOKENS.StylistRepository, {
  useClass: StylistRepository,
});

container.registerSingleton<IProfileService>(TOKENS.ProfileService, ProfileService);

container.register<IImageService>(TOKENS.ImageService, {
  useClass: S3Service,
});
container.register(AuthController, { useClass: AuthController });

export const resolveAuthController = () => container.resolve(AuthController);
