import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

import { STYLIST_SERVICE_ROUTES } from '../constants/stylistService.routes';
import { resolveStylistServiceController } from '../index';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  ToggleStylistServiceStatusSchema,
  StylistServicePaginationSchema,
} from '../dto/stylistService.schema';

const router = Router();
const controller = resolveStylistServiceController();

// PUBLIC ROUTES
router.get(
  STYLIST_SERVICE_ROUTES.BASE + STYLIST_SERVICE_ROUTES.USER.STYLISTS_BY_SERVICE,
  controller.getStylistsByService.bind(controller),
);

router.get(
  STYLIST_SERVICE_ROUTES.BASE + STYLIST_SERVICE_ROUTES.USER.LIST_BY_STYLIST,
  controller.list.bind(controller),
);

router.use('/admin', authMiddleware);

router.get(
  STYLIST_SERVICE_ROUTES.BASE + STYLIST_SERVICE_ROUTES.ADMIN.LIST,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.list.bind(controller),
);

router.get(
  STYLIST_SERVICE_ROUTES.BASE + STYLIST_SERVICE_ROUTES.ADMIN.LIST_PAGINATED,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: StylistServicePaginationSchema }),
  controller.listPaginated.bind(controller),
);

router.patch(
  STYLIST_SERVICE_ROUTES.BASE + STYLIST_SERVICE_ROUTES.ADMIN.TOGGLE_STATUS,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: ToggleStylistServiceStatusSchema }),
  controller.toggleStatus.bind(controller),
);

export default router;
