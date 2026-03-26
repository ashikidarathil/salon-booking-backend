import { Router } from 'express';
import { resolveBranchController } from '../index';

import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { BRANCH_ROUTES } from '../constants/branch.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateBranchSchema,
  UpdateBranchSchema,
  GetNearestBranchesSchema,
} from '../dto/branch.schema';

const router = Router();
const controller = resolveBranchController();

router.get(BRANCH_ROUTES.PUBLIC.BRANCH.LIST, controller.listPublic.bind(controller));
router.get(
  BRANCH_ROUTES.PUBLIC.BRANCH.PAGINATED_LIST,
  controller.listPublicPaginated.bind(controller),
);
router.get(BRANCH_ROUTES.PUBLIC.BRANCH.BY_ID(':id'), controller.getPublic.bind(controller));
router.post(
  BRANCH_ROUTES.PUBLIC.BRANCH.NEAREST,
  validate({ body: GetNearestBranchesSchema }),
  controller.getNearestBranches.bind(controller),
);

router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(BRANCH_ROUTES.ADMIN.BRANCH.BASE, controller.list.bind(controller));

router.get(
  BRANCH_ROUTES.ADMIN.BRANCH.PAGINATED_LIST,
  controller.getPaginatedBranches.bind(controller),
);

router.post(
  BRANCH_ROUTES.ADMIN.BRANCH.BASE,
  validate({ body: CreateBranchSchema }),
  controller.create.bind(controller),
);

router.patch(
  BRANCH_ROUTES.ADMIN.BRANCH.BY_ID(':id'),
  validate({ body: UpdateBranchSchema }),
  controller.update.bind(controller),
);

router.patch(BRANCH_ROUTES.ADMIN.BRANCH.SOFT_DELETE(':id'), controller.disable.bind(controller));

router.patch(BRANCH_ROUTES.ADMIN.BRANCH.RESTORE(':id'), controller.restore.bind(controller));

export default router;
