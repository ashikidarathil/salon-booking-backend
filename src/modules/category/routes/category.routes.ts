// backend/src/modules/category/routes/category.routes.ts

import { Router } from 'express';
import { resolveCategoryController } from '../index';

import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { CATEGORY_ROUTES } from '../constants/category.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryPaginationSchema,
} from '../dto/category.schema';

const router = Router();
const controller = resolveCategoryController();

router.get(CATEGORY_ROUTES.PUBLIC.CATEGORY.LIST, controller.listPublic.bind(controller));

router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(
  CATEGORY_ROUTES.ADMIN.CATEGORY.PAGINATED,
  validate({ query: CategoryPaginationSchema }),
  controller.getPaginatedCategories.bind(controller),
);

router.get(CATEGORY_ROUTES.ADMIN.CATEGORY.BASE, controller.listAdmin.bind(controller));

router.post(
  CATEGORY_ROUTES.ADMIN.CATEGORY.BASE,
  validate({ body: CreateCategorySchema }),
  controller.create.bind(controller),
);

router.patch(
  CATEGORY_ROUTES.ADMIN.CATEGORY.BY_ID(':id'),
  validate({ body: UpdateCategorySchema }),
  controller.update.bind(controller),
);

router.patch(
  CATEGORY_ROUTES.ADMIN.CATEGORY.SOFT_DELETE(':id'),
  controller.softDelete.bind(controller),
);

router.patch(CATEGORY_ROUTES.ADMIN.CATEGORY.RESTORE(':id'), controller.restore.bind(controller));

export default router;
