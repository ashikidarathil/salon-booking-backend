import { Router } from 'express';
import { resolveScheduleController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { SCHEDULE_ROUTES } from '../constants/schedule.constants';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  WeeklyScheduleRequestSchema,
  DailyOverrideRequestSchema,
  StylistBreakRequestSchema,
} from '../dto/schedule.schema';

const router = Router();
const controller = resolveScheduleController();

router.use(authMiddleware);

// STYLIST & ADMIN ROUTES
router.patch(
  SCHEDULE_ROUTES.WEEKLY_DETAIL,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: WeeklyScheduleRequestSchema }),
  controller.updateWeekly.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.WEEKLY,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getWeekly.bind(controller),
);

router.post(
  SCHEDULE_ROUTES.DAILY,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: DailyOverrideRequestSchema }),
  controller.createDailyOverride.bind(controller),
);

router.delete(
  SCHEDULE_ROUTES.DAILY + SCHEDULE_ROUTES.BY_ID,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.deleteDailyOverride.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.DAILY,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getDailyOverrides.bind(controller),
);

// BREAKS
router.post(
  SCHEDULE_ROUTES.BREAKS,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: StylistBreakRequestSchema }),
  controller.addBreak.bind(controller),
);

router.delete(
  SCHEDULE_ROUTES.BREAKS_BY_ID,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.deleteBreak.bind(controller),
);

router.get(
  SCHEDULE_ROUTES.BY_STYLIST + SCHEDULE_ROUTES.BREAKS,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN, UserRole.USER]),
  controller.getBreaks.bind(controller),
);

export default router;
