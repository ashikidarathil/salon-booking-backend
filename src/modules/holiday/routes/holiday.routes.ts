import { Router } from 'express';
import { resolveHolidayController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { HOLIDAY_ROUTES } from '../constants/holiday.constants';

const router = Router();
const controller = resolveHolidayController();

router.post(
  HOLIDAY_ROUTES.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.createHoliday.bind(controller),
);

router.get(HOLIDAY_ROUTES.BASE, authMiddleware, controller.getHolidays.bind(controller));

router.delete(
  HOLIDAY_ROUTES.BASE + HOLIDAY_ROUTES.BY_ID,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.deleteHoliday.bind(controller),
);

export default router;
