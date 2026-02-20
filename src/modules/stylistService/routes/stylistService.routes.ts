import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { STYLIST_SERVICE_ROUTES } from '../constants/stylistService.routes';
import { resolveStylistServiceController } from '../index';

const router = Router();
const controller = resolveStylistServiceController();

router.get(
  STYLIST_SERVICE_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.list,
);

router.get(
  STYLIST_SERVICE_ROUTES.ADMIN.LIST_PAGINATED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listPaginated,
);

router.patch(
  STYLIST_SERVICE_ROUTES.ADMIN.TOGGLE_STATUS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleStatus,
);

export default router;
