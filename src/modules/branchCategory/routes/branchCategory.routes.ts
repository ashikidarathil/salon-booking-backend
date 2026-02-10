import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_CATEGORY_ROUTES } from '../constants/branchCategory.routes';
import { resolveBranchCategoryController } from '../index';

const router = Router();
const controller = resolveBranchCategoryController();

router.get(
  BRANCH_CATEGORY_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.list,
);

router.get(
  BRANCH_CATEGORY_ROUTES.ADMIN.LIST_PAGINATED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listPaginated,
);

router.patch(
  BRANCH_CATEGORY_ROUTES.ADMIN.TOGGLE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggle,
);

export default router;
