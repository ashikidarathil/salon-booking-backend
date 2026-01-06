import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { StylistInviteRepository } from './repository/StylistInviteRepository';
import type { IStylistInviteRepository } from './repository/IStylistInviteRepository';

import { StylistRepository } from './repository/StylistRepository';
import type { IStylistRepository } from './repository/IStylistRepository';

import { StylistInviteService } from './service/StylistInviteService';
import type { IStylistInviteService } from './service/IStylistInviteService';

import { EmailService } from '../../common/service/email/EmailService';
import type { IEmailService } from '../../common/service/email/IEmailService';

import { StylistService } from './service/StylistService';
import type { IStylistService } from './service/IStylistService';

import { StylistInviteController } from './controller/StylistInviteController';
import { StylistController } from './controller/StylistController';

container.register<IStylistInviteRepository>(TOKENS.StylistInviteRepository, {
  useClass: StylistInviteRepository,
});
container.register<IStylistRepository>(TOKENS.StylistRepository, {
  useClass: StylistRepository,
});

container.register<IEmailService>(TOKENS.EmailService, {
  useClass: EmailService,
});

container.register<IStylistInviteService>(TOKENS.StylistInviteService, {
  useClass: StylistInviteService,
});

container.register<IStylistService>(TOKENS.StylistService, {
  useClass: StylistService,
});

container.register(StylistInviteController, {
  useClass: StylistInviteController,
});

container.register(StylistController, {
  useClass: StylistController,
});

export const resolveStylistInviteController = () => container.resolve(StylistInviteController);
export const resolveStylistController = () => container.resolve(StylistController);
