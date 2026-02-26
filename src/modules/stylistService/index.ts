import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { StylistServiceRepository } from './repository/stylistService.repository';
import { StylistServiceService } from './service/stylistService.service';
import { StylistServiceController } from './controller/stylistService.controller';

container.registerSingleton(TOKENS.StylistServiceRepository, StylistServiceRepository);
container.registerSingleton(TOKENS.StylistServiceService, StylistServiceService);
container.registerSingleton(TOKENS.StylistServiceController, StylistServiceController);

export const resolveStylistServiceController = () =>
  container.resolve<StylistServiceController>(TOKENS.StylistServiceController);
