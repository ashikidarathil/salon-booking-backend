import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import type { IUserRepository } from './repository/IUserRepository';
import { UserRepository } from './repository/UserRepository';

import type { IOtpService } from './service/IOtpService';
import { RedisOtpService } from './service/OtpService';

import type { IAuthService } from './service/IAuthService';
import { AuthService } from './service/AuthService';

import { AuthController } from './controller/AuthController';

// Register bindings (interface -> class)
container.register<IUserRepository>(TOKENS.UserRepository, { useClass: UserRepository });
container.register<IOtpService>(TOKENS.OtpService, { useClass: RedisOtpService });
container.register<IAuthService>(TOKENS.AuthService, { useClass: AuthService });

// Controller as itself
container.register(AuthController, { useClass: AuthController });

export const resolveAuthController = () => container.resolve(AuthController);
