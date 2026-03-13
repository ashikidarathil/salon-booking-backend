import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './service/notification.service';
import { NotificationController } from './controller/notification.controller';

container.registerSingleton(TOKENS.NotificationRepository, NotificationRepository);
container.registerSingleton(TOKENS.NotificationService, NotificationService);
container.registerSingleton(TOKENS.NotificationController, NotificationController);

export const resolveNotificationController = () => {
  return container.resolve<NotificationController>(TOKENS.NotificationController);
};
