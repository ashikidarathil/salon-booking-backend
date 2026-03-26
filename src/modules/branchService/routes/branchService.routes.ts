import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_SERVICE_ROUTES } from '../constants/branchService.routes';
import { resolveBranchServiceController } from '../index';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  UpsertBranchServiceSchema,
  ToggleBranchServiceStatusSchema,
  BranchServicePaginationSchema,
} from '../dto/branchService.schema';

const router = Router();
const controller = resolveBranchServiceController();
router.get(
  BRANCH_SERVICE_ROUTES.PUBLIC.LIST_PAGINATED,
  validate({ query: BranchServicePaginationSchema }),
  controller.listPaginatedPublic.bind(controller),
);
router.get(BRANCH_SERVICE_ROUTES.PUBLIC.BY_ID, controller.getDetailsPublic.bind(controller));

router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(BRANCH_SERVICE_ROUTES.ADMIN.LIST, controller.list);

router.get(
  BRANCH_SERVICE_ROUTES.ADMIN.LIST_PAGINATED,
  validate({ query: BranchServicePaginationSchema }),
  controller.listPaginated,
);

router.patch(
  BRANCH_SERVICE_ROUTES.ADMIN.UPSERT,
  validate({ body: UpsertBranchServiceSchema }),
  controller.upsert,
);

router.patch(
  BRANCH_SERVICE_ROUTES.ADMIN.TOGGLE_STATUS,
  validate({ body: ToggleBranchServiceStatusSchema }),
  controller.toggleStatus,
);

export default router;
