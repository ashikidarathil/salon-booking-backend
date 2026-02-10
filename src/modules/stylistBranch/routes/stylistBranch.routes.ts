import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { STYLIST_BRANCH_ROUTES } from '../constants/stylistBranch.routes';
import { resolveStylistBranchController } from '../index';

const router = Router();
const controller = resolveStylistBranchController();

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.LIST_BRANCH_STYLISTS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.list,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.OPTIONS_UNASSIGNED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.options,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.LIST_BRANCH_STYLISTS_PAGINATED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listPaginated,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.OPTIONS_UNASSIGNED_PAGINATED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.optionsPaginated,
);

router.post(
  STYLIST_BRANCH_ROUTES.ADMIN.ASSIGN,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.assign,
);

router.patch(
  STYLIST_BRANCH_ROUTES.ADMIN.UNASSIGN,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.unassign,
);

router.patch(
  STYLIST_BRANCH_ROUTES.ADMIN.CHANGE_BRANCH,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.changeBranch,
);

export default router;
