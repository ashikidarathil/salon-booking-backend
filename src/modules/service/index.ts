import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import type { IServiceRepository } from './repository/IServiceRepository';
import { ServiceRepository } from './repository/service.repository';

import type { IServiceService } from './service/IServiceService';
import { ServiceService } from './service/service.service';

import { ServiceController } from './controller/service.controller';

container.register<IServiceRepository>(TOKENS.ServiceRepository, {
  useClass: ServiceRepository,
});

container.register<IServiceService>(TOKENS.ServiceService, {
  useClass: ServiceService,
});

container.register(ServiceController, {
  useClass: ServiceController,
});

export const resolveServiceController = () => container.resolve(ServiceController);
