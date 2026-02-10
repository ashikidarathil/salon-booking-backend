import { Router } from 'express';
import { resolveBranchController } from '../index';

import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_ROUTES } from '../constants/branch.routes';

const router = Router();
const controller = resolveBranchController();

/* =========================
   PUBLIC ROUTES
========================= */
router.get(BRANCH_ROUTES.PUBLIC.BRANCH.LIST, controller.listPublic.bind(controller));
router.get(
  BRANCH_ROUTES.PUBLIC.BRANCH.PAGINATED_LIST,
  controller.listPublicPaginated.bind(controller),
);
router.get(BRANCH_ROUTES.PUBLIC.BRANCH.BY_ID(':id'), controller.getPublic.bind(controller));
router.post(BRANCH_ROUTES.PUBLIC.BRANCH.NEAREST, controller.getNearestBranches.bind(controller));

router.get(
  BRANCH_ROUTES.ADMIN.BRANCH.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.list.bind(controller),
);

router.get(
  BRANCH_ROUTES.ADMIN.BRANCH.PAGINATED_LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getPaginatedBranches.bind(controller),
);

router.post(
  BRANCH_ROUTES.ADMIN.BRANCH.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.create.bind(controller),
);

router.patch(
  BRANCH_ROUTES.ADMIN.BRANCH.BY_ID(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.update.bind(controller),
);

router.patch(
  BRANCH_ROUTES.ADMIN.BRANCH.SOFT_DELETE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.disable.bind(controller),
);

router.patch(
  BRANCH_ROUTES.ADMIN.BRANCH.RESTORE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.restore.bind(controller),
);

export default router;
