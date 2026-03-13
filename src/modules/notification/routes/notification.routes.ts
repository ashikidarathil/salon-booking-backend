import { Router } from 'express';
import { resolveNotificationController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { NOTIFICATION_ROUTES } from '../constants/notification.routes';

const router = Router();
const controller = resolveNotificationController();

router.use(authMiddleware);

router.get(NOTIFICATION_ROUTES.GET_MY, controller.getMyNotifications);
router.patch(NOTIFICATION_ROUTES.MARK_READ, controller.markAsRead);
router.patch(NOTIFICATION_ROUTES.MARK_ALL_READ, controller.markAllAsRead);

export default router;
