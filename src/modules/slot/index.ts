import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { SlotService } from './service/slot.service';

import { SlotController } from './controller/slot.controller';

import { SlotRepository } from './repository/slot.repository';

container.register(TOKENS.SlotRepository, {
  useClass: SlotRepository,
});

container.register(TOKENS.SlotService, {
  useClass: SlotService,
});

container.register(SlotController, {
  useClass: SlotController,
});

export const resolveSlotController = () => container.resolve(SlotController);
