import { Router } from 'express';
import { resolveHolidayController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { HOLIDAY_ROUTES } from '../constants/holiday.constants';
import { validate } from '../../../common/middleware/validation.middleware';
import { HolidayRequestSchema } from '../dto/holiday.schema';

const router = Router();
const controller = resolveHolidayController();

router.use('/holidays', authMiddleware);

router.post(
  HOLIDAY_ROUTES.BASE,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: HolidayRequestSchema }),
  controller.createHoliday.bind(controller),
);

router.get(HOLIDAY_ROUTES.BASE, controller.getHolidays.bind(controller));

router.delete(
  HOLIDAY_ROUTES.BASE + HOLIDAY_ROUTES.BY_ID,
  roleMiddleware([UserRole.ADMIN]),
  controller.deleteHoliday.bind(controller),
);

export default router;
