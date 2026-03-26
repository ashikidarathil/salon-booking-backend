import { Router } from 'express';
import { resolveOffDayController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { OFF_DAY_ROUTES } from '../constants/offDay.constants';
import { validate } from '../../../common/middleware/validation.middleware';
import { OffDayRequestSchema, OffDayActionSchema } from '../dto/offDay.schema';

const router = Router();
const controller = resolveOffDayController();

router.use('/off-days', authMiddleware);

// STYLIST ROUTES
router.post(
  OFF_DAY_ROUTES.BASE,
  roleMiddleware([UserRole.STYLIST]),
  validate({ body: OffDayRequestSchema }),
  controller.requestOffDay.bind(controller),
);

router.get(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.MY,
  roleMiddleware([UserRole.STYLIST]),
  controller.getMyOffDays.bind(controller),
);

// ADMIN & SHARED ROUTES
router.get(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_STYLIST,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST, UserRole.USER]),
  controller.getStylistOffDays.bind(controller),
);

router.get(
  OFF_DAY_ROUTES.BASE,
  roleMiddleware([UserRole.ADMIN]),
  controller.getAllOffDays.bind(controller),
);

router.patch(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_ID + OFF_DAY_ROUTES.STATUS,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: OffDayActionSchema }),
  controller.updateStatus.bind(controller),
);

router.delete(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_ID,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.deleteOffDay.bind(controller),
);

export default router;
