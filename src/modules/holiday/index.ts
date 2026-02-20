import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { HolidayRepository } from './repository/holiday.repository';
import { HolidayService } from './service/holiday.service';
import { HolidayController } from './controller/holiday.controller';
import { IHolidayController } from './controller/IHolidayController';

// Repository
container.registerSingleton(TOKENS.HolidayRepository, HolidayRepository);

// Service
container.registerSingleton(TOKENS.HolidayService, HolidayService);

// Controller
container.registerSingleton(TOKENS.HolidayController, HolidayController);

export function resolveHolidayController(): IHolidayController {
  return container.resolve<IHolidayController>(TOKENS.HolidayController);
}
