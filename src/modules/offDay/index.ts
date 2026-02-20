import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { OffDayRepository } from './repository/offDay.repository';
import { OffDayService } from './service/offDay.service';
import { OffDayController } from './controller/offDay.controller';
import { IOffDayController } from './controller/IOffDayController';

// Repository
container.registerSingleton(TOKENS.OffDayRepository, OffDayRepository);

// Service
container.registerSingleton(TOKENS.OffDayService, OffDayService);

// Controller
container.registerSingleton(TOKENS.OffDayController, OffDayController);

export function resolveOffDayController(): IOffDayController {
  return container.resolve<IOffDayController>(TOKENS.OffDayController);
}
