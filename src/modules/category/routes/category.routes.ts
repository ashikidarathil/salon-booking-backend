// backend/src/modules/category/routes/category.routes.ts

import { Router } from 'express';
import { resolveCategoryController } from '../index';

import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { CATEGORY_ROUTES } from '../constants/category.routes';

const router = Router();
const controller = resolveCategoryController();

// PUBLIC ROUTES

router.get(CATEGORY_ROUTES.PUBLIC.CATEGORY.LIST, controller.listPublic.bind(controller));

/* =========================
   ADMIN ROUTES
========================= */
router.get(
  CATEGORY_ROUTES.ADMIN.CATEGORY.PAGINATED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getPaginatedCategories.bind(controller),
);

router.get(
  CATEGORY_ROUTES.ADMIN.CATEGORY.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listAdmin.bind(controller),
);

router.post(
  CATEGORY_ROUTES.ADMIN.CATEGORY.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.create.bind(controller),
);

router.patch(
  CATEGORY_ROUTES.ADMIN.CATEGORY.BY_ID(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.update.bind(controller),
);

router.patch(
  CATEGORY_ROUTES.ADMIN.CATEGORY.SOFT_DELETE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.softDelete.bind(controller),
);

router.patch(
  CATEGORY_ROUTES.ADMIN.CATEGORY.RESTORE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.restore.bind(controller),
);

export default router;
