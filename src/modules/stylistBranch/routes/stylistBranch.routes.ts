import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { STYLIST_BRANCH_ROUTES } from '../constants/stylistBranch.routes';
import { resolveStylistBranchController } from '../index';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  AssignStylistSchema,
  UnassignStylistSchema,
  ChangeBranchSchema,
} from '../dto/stylistBranch.schema';

const router = Router();
const controller = resolveStylistBranchController();

router.get(STYLIST_BRANCH_ROUTES.PUBLIC.LIST_BRANCH_STYLISTS, controller.list);

router.use(['/admin', '/stylists'], authMiddleware);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.LIST_BRANCH_STYLISTS,
  roleMiddleware([UserRole.ADMIN]),
  controller.list,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.OPTIONS_UNASSIGNED,
  roleMiddleware([UserRole.ADMIN]),
  controller.options,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.LIST_BRANCH_STYLISTS_PAGINATED,
  roleMiddleware([UserRole.ADMIN]),
  controller.listPaginated,
);

router.get(
  STYLIST_BRANCH_ROUTES.ADMIN.OPTIONS_UNASSIGNED_PAGINATED,
  roleMiddleware([UserRole.ADMIN]),
  controller.optionsPaginated,
);

router.post(
  STYLIST_BRANCH_ROUTES.ADMIN.ASSIGN,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: AssignStylistSchema }),
  controller.assign,
);

router.patch(
  STYLIST_BRANCH_ROUTES.ADMIN.UNASSIGN,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: UnassignStylistSchema }),
  controller.unassign,
);

router.patch(
  STYLIST_BRANCH_ROUTES.ADMIN.CHANGE_BRANCH,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: ChangeBranchSchema }),
  controller.changeBranch,
);

router.get(
  STYLIST_BRANCH_ROUTES.STYLIST.GET_STYLIST_BRANCHES,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistBranches,
);

export default router;
