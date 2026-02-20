import { Router } from 'express';
import { resolveScheduleController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { SCHEDULE_ROUTES } from '../constants/schedule.constants';

const router = Router();
const controller = resolveScheduleController();

// STYLIST & ADMIN ROUTES
router.patch(
  SCHEDULE_ROUTES.WEEKLY_DETAIL,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.updateWeekly.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.WEEKLY,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getWeekly.bind(controller),
);

router.post(
  SCHEDULE_ROUTES.DAILY,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.createDailyOverride.bind(controller),
);

router.delete(
  SCHEDULE_ROUTES.DAILY + SCHEDULE_ROUTES.BY_ID,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.deleteDailyOverride.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.DAILY,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getDailyOverrides.bind(controller),
);

// BREAKS
router.post(
  SCHEDULE_ROUTES.BREAKS,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.addBreak.bind(controller),
);

router.delete(
  SCHEDULE_ROUTES.BREAKS_BY_ID,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.deleteBreak.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.BREAKS,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getBreaks.bind(controller),
);

export default router;
