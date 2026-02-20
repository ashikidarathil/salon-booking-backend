import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { StylistServiceRepository } from './repository/stylistService.repository';
import { StylistServiceService } from './service/stylistService.service';
import { StylistServiceController } from './controller/stylistService.controller';

container.register(TOKENS.StylistServiceMappingRepository, {
  useClass: StylistServiceRepository,
});
container.register(TOKENS.StylistServiceMappingService, { useClass: StylistServiceService });
container.register(StylistServiceController, { useClass: StylistServiceController });

export const resolveStylistServiceController = () => container.resolve(StylistServiceController);
