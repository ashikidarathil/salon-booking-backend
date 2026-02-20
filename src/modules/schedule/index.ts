import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { WeeklyScheduleRepository } from './repository/weeklySchedule.repository';
import { DailyOverrideRepository } from './repository/dailyOverride.repository';
import { StylistBreakRepository } from './repository/stylistBreak.repository';
import { ScheduleService } from './service/schedule.service';
import { ScheduleController } from './controller/schedule.controller';
import { IScheduleController } from './controller/IScheduleController';

// Repositories
container.registerSingleton(TOKENS.WeeklyScheduleRepository, WeeklyScheduleRepository);
container.registerSingleton(TOKENS.DailyOverrideRepository, DailyOverrideRepository);
container.registerSingleton(TOKENS.StylistBreakRepository, StylistBreakRepository);

// Service
container.registerSingleton(TOKENS.ScheduleService, ScheduleService);

// Controller
container.registerSingleton(TOKENS.ScheduleController, ScheduleController);

export function resolveScheduleController(): IScheduleController {
  return container.resolve<IScheduleController>(TOKENS.ScheduleController);
}
