import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_SERVICE_ROUTES } from '../constants/branchService.routes';
import { resolveBranchServiceController } from '../index';

const router = Router();
const controller = resolveBranchServiceController();
router.get(
  '/branches/:branchId/services/paginated',
  controller.listPaginatedPublic.bind(controller),
);
router.get('/branches/:branchId/services/:serviceId', controller.getDetailsPublic.bind(controller));

router.get(
  BRANCH_SERVICE_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.list,
);

router.get(
  '/admin/branches/:branchId/services/paginated',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listPaginated,
);

router.patch(
  BRANCH_SERVICE_ROUTES.ADMIN.UPSERT,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.upsert,
);

router.patch(
  BRANCH_SERVICE_ROUTES.ADMIN.TOGGLE_STATUS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleStatus,
);

export default router;
