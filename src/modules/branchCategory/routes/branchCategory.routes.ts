import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_CATEGORY_ROUTES } from '../constants/branchCategory.routes';
import { resolveBranchCategoryController } from '../index';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  ToggleBranchCategorySchema,
  BranchCategoryPaginationSchema,
} from '../dto/branchCategory.schema';

const router = Router();
const controller = resolveBranchCategoryController();

router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(BRANCH_CATEGORY_ROUTES.ADMIN.LIST, controller.list);

router.get(
  BRANCH_CATEGORY_ROUTES.ADMIN.LIST_PAGINATED,
  validate({ query: BranchCategoryPaginationSchema }),
  controller.listPaginated,
);

router.patch(
  BRANCH_CATEGORY_ROUTES.ADMIN.TOGGLE,
  validate({ body: ToggleBranchCategorySchema }),
  controller.toggle,
);

export default router;
