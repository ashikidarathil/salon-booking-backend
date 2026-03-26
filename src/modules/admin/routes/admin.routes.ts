import { Router } from 'express';
import { resolveUserController, resolveAdminDashboardController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  ToggleBlockUserSchema,
  UserPaginationQuerySchema,
  AdminStatsQuerySchema,
} from '../dto/admin.dto';

const router = Router();
const userController = resolveUserController();
const dashboardController = resolveAdminDashboardController();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

router.patch(
  API_ROUTES.ADMIN.USERS.TOGGLE_BLOCK(':userId'),
  validate({ body: ToggleBlockUserSchema }),
  userController.toggleBlock.bind(userController),
);

router.get(
  API_ROUTES.ADMIN.USERS.GET_USERS,
  validate({ query: UserPaginationQuerySchema }),
  userController.getUsers.bind(userController),
);

router.get(
  API_ROUTES.ADMIN.DASHBOARD.STATS,
  validate({ query: AdminStatsQuerySchema }),
  dashboardController.getStats.bind(dashboardController),
);

export default router;
