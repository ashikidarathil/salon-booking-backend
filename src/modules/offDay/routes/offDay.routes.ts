import { Router } from 'express';
import { resolveOffDayController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { OFF_DAY_ROUTES } from '../constants/offDay.constants';

const router = Router();
const controller = resolveOffDayController();

// STYLIST ROUTES
router.post(
  OFF_DAY_ROUTES.BASE,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST]),
  controller.requestOffDay.bind(controller),
);

router.get(
  OFF_DAY_ROUTES.BASE + '/my',
  authMiddleware,
  roleMiddleware([UserRole.STYLIST]),
  controller.getMyOffDays.bind(controller),
);

// ADMIN & SHARED ROUTES
router.get(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_STYLIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST, UserRole.USER]),
  controller.getStylistOffDays.bind(controller),
);

router.get(
  OFF_DAY_ROUTES.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getAllOffDays.bind(controller),
);

router.patch(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_ID + '/status',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.updateStatus.bind(controller),
);

router.delete(
  OFF_DAY_ROUTES.BASE + OFF_DAY_ROUTES.BY_ID,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.deleteOffDay.bind(controller),
);

export default router;
